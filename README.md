[![npm version][npm-image]][npm-url]
[![downloads][downloads-image]][npm-url]
[![build status][build-image]][build-url]
[![coverage status][coverage-image]][coverage-url]
[![Language grade: JavaScript][lgtm-image]][lgtm-url]
[![Node.JS version][node-version]][node-url]


<img src="https://raw.githubusercontent.com/grantila/suretype/master/assets/logo.svg" width="100%" />

Suretype is a JSON validator targeting TypeScript and JSON Schema. It is **ridiculously type safe** when used in TypeScript, which is good for accuraccy, but also for aiding IDE auto-complete.

<details style="padding-left: 32px; border-left: 4px solid gray;">
<summary>It's as easy as Joi, but ~50x faster, (at least) as typesafe as Superstruct, but ~80x faster.</summary>
<p>

```
❯ yarn benchmark
Joi x 385,563 ops/sec ±0.39% (95 runs sampled)
Superstruct x 257,141 ops/sec ±0.34% (90 runs sampled)
suretype x 21,499,582 ops/sec ±0.85% (92 runs sampled)
```

</p>
</details>

It supports most (if not all) of JSON schema, and *nothing beyond that*, so that the validator schemas written in TypeScript (or JavaScript) can be ensured to be convertible into JSON schema. This also prevents suretype from becoming feature bloated - it has a small and extremely simple API.

Errors are prettified using [awesome-ajv-errors][awesome-ajv-errors-url].

From a validator schema defined with suretype, you can trivially:

 * Compile a validator function (using the **very** fast [Ajv](https://www.npmjs.com/package/ajv))
 * Extract the corresponding JSON Schema
 * Deduce a TypeScript type corresponding to the validator schema (at compile-time!)

<!--
 * Using [typeconv](https://github.com/grantila/typeconv):
   * Export (convert) the validator schema into JSON Schema, Open API, TypeScript types or GraphQL, or;
   * The opposite (!); convert JSON Schema, Open API, TypeScript types or GraphQL **into** suretype validators! 🎉

The above makes it ideal in TypeScript environments. When used in RESTful applications, the JSON Schema can be used to document the APIs using OpenAPI. When used in libraries / clients, the TypeScript interfaces can be extracted to standalone files (including JSDoc comments).
-->


# Minimal example

The following is a validator schema using suretype:

```ts
import { v } from "suretype"

const userSchema = v.object( {
    firstName: v.string( ).required( ),
    lastName: v.string( ),
    age: v.number( ).gte( 21 ),
} );
```

This schema object can be compiled into validator functions, and it can be used to deduce the corresponding TypeScript type:

```ts
import type { TypeOf } from "suretype"

type User = TypeOf< typeof userSchema >;
```

This type is compile-time constructed (or *deduced*), and is semantically identical to:

```ts
interface User {
    firstName: string;
    lastName?: string;
    age?: number;
}
```

Note the `?` for the optional properties, i.e. those that aren't followed by `required()`.

There are three ways of compiling a validator function; choose the one that best fits your application and situation. Given:

```ts
import { compile } from "suretype"

const data = ... // get data from somewhere, e.g. as a TypeScript unknown
```


## Standard validator

The default behaviour of `compile` is to return a validator function returning decorated Ajv output.

```ts
const userValidator = compile( userSchema );
userValidator( data );
// { ok: true } or
// { ok: false, errors: [Ajv errors...], explanation: string }
```

The `explanation` is a pretty-printed error.


## Type-guarded validator

Use the second optional argument to specify `simple` mode. The return is a boolean, *type guarded*.

```ts
const isUser = compile( userSchema, { simple: true } );
isUser( data ); // true | false, usable as guard:

// Realistic usage:

if ( isUser( data ) ) {
    // Valid TypeScript, <data> is now typed(!) as the User type above
    data.firstName;
} else {
     // TypeScript compile error(!), <data> is unknown
    data.firstName;
}
```


## Type-ensured validator

Specify `ensure` mode to get a validator function which returns the ***exact*** same output as the input (referentially equal), but with a deduced type. *This is often the most practical mode*.

```ts
const ensureUser = compile( userSchema, { ensure: true } );
ensureUser( data ); // returns data or throws an error if the data isn't valid.

// Realistic usage:

const user = ensureUser( data );
// <user> is ensured to be valid, *and* is of type User (as above)
user.firstName; // string
user.foo; // TypeScript compile-time error, there is no `foo` in User
```

On validation failure, the error thrown will be of the class `ValidationError`, which has both the raw Ajv errors as an `errors` property, and the pretty explanation in the property `explanation`.

Note: The returned ensurer function can optionally take a type parameter as long as it is equal to or compatible with the deduced type. This means that if the type is exported from suretype to decorated TypeScript declaration files (with annotations), those types can be used as a type parameter, and the returned type will be that type. Example:

```ts
import type { User } from './generated/user'
const user = ensureUser< User >( data );
// user is now of type User
```


# Decorating schemas

You can decorate a validator schema using `suretype()`. The return value is still a validator schema, but when exporting it, the decorations will be included.

```ts
import { suretype, v } from "suretype"

const cartItemSchema = suretype(
    // Decorations
    { name: "CartItem" },
    // The validator schema
    v.object( {
        productId: v.string( ),
        // ...
    } )
);
```

The decorator interface (i.e. the fields you can decorate) is:

```ts
interface Decorations {
	name: string;
	title?: string;
	description?: string;
	examples?: Array< string >;
}
```

where only the `name` is required.


# Thorough example

The following are two types, one using (or *depending on*) the other. They are *named*, which will be reflected in the JSON schema, shown below.

The `userSchema` is the same as in the above example, although it's wrapped in `suretype()` which decorates it with a name and other attributes.

<details style="padding-left: 32px;border-left: 4px solid gray;">
<summary>Given these validation schemas:</summary>
<p>

```ts
import { suretype, v } from "suretype"

const userSchema = suretype(
    {
        name: "V1User",
        title: "User type, version 1",
        description: `
            A User object must have a firstName property,
            all other properties are optional.
        `,
        examples: [
            {
                firstName: "John",
                lastName: "Doe",
            }
        ],
    },
    v.object( {
        firstName: v.string( ).required( ),
        lastName: v.string( ),
        age: v.number( ).gte( 21 ),
    } )
);

const messageSchema = suretype(
    {
        name: "V1Message",
        title: "A message from a certain user",
    },
    v.object( {
        user: userSchema.required( ),
        line: v.string( ).required( ),
    } )
);
```

</p>
</details>

The JSON schema for these can be extracted, either each type by itself:

```ts
import { extractSingleJsonSchema } from "suretype"

const jsonSchema = extractSingleJsonSchema( userSchema ); // The JSON schema for User
```

or as all types at once, into one big JSON schema. In this case, all validation schemas provided **must** be wrapped with `suretype()`, as they will become JSON schema *"definitions"* and therefore must have at least a name.

```ts
import { extractJsonSchema } from "suretype"

const jsonSchema = extractJsonSchema( [ userSchema, messageSchema ] );
```

The `jsonSchema` *object* (which can be `JSON.stringify`'d) will be something like:

<details style="padding-left: 32px;border-left: 4px solid gray;">
<summary>JSON Schema</summary>
<p>

```js
{
    "$schema": "http://json-schema.org/draft-07/schema#",
    "definitions": {
        "V1User": { // <-- This corresponds to the "name" property in suretype()
            "title": "User type, version 1",
            "description": "A User object must have a firstName property,\nall other properties are optional.",
            "examples": [
                {
                    "firstName": "John",
                    "lastName": "Doe"
                }
            ],
            "type": "object",
            "properties": {
                "firstName": { "type": "string" },
                "lastName": { "type": "string" },
                "age": { "type": "number", "minimum": 13 }
            },
            "required": [ "firstName" ]
        },
        "V1Message": {
            "title": "A message from a certain user",
            "type": "object",
            "properties": {
                "user": { "$ref": "#/definitions/V1User" }, // <-- Proper references
                "line": { "type": "string" }
            },
            "required": [ "user", "line" ]
        }
    }
}
```

</p>
</details>

<!--
# suretype ❤️ typeconv

A better (well, often much more practical) way of converting suretype validator schemas into JSON Schema is by using [`typeconv`][typeconv-github-url] [![npm version][typeconv-image]][typeconv-npm-url].

You can convert from suretype validator schemas to:
 * TypeScript interfaces (pretty printed with JSDoc comments)
 * JSON Schema
 * Open API
 * GraphQL

You can also convert **from** any of these formats ***into*** suretype validators!
-->


[npm-image]: https://img.shields.io/npm/v/suretype.svg
[npm-url]: https://npmjs.org/package/suretype
[downloads-image]: https://img.shields.io/npm/dm/suretype.svg
[build-image]: https://img.shields.io/github/workflow/status/grantila/suretype/Master.svg
[build-url]: https://github.com/grantila/suretype/actions?query=workflow%3AMaster
[coverage-image]: https://coveralls.io/repos/github/grantila/suretype/badge.svg?branch=master
[coverage-url]: https://coveralls.io/github/grantila/suretype?branch=master
[lgtm-image]: https://img.shields.io/lgtm/grade/javascript/g/grantila/suretype.svg?logo=lgtm&logoWidth=18
[lgtm-url]: https://lgtm.com/projects/g/grantila/suretype/context:javascript
[node-version]: https://img.shields.io/node/v/suretype
[node-url]: https://nodejs.org/en/
[awesome-ajv-errors-url]: https://github.com/grantila/awesome-ajv-errors

[typeconv-image]: https://img.shields.io/npm/v/typeconv.svg
[typeconv-github-url]: https://github.com/grantila/typeconv
[typeconv-npm-url]: https://npmjs.org/package/typeconv
