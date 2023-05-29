[![npm version][npm-image]][npm-url]
[![downloads][downloads-image]][npm-url]
[![build status][build-image]][build-url]
[![coverage status][coverage-image]][coverage-url]
[![Node.JS version][node-version]][node-url]


<img src="https://raw.githubusercontent.com/grantila/suretype/master/.github/images/logo.svg" width="100%" />

Suretype is a JSON validator targeting TypeScript and JSON Schema. It is **ridiculously type safe** when used in TypeScript, which is good for accuraccy, but also for aiding IDE auto-complete.

It's as easy as Joi, but ~70x faster.

It's (at least) as typesafe as Superstruct, but ~100x faster. ~2500x faster than Zod and ~1600x faster than ow.

*These are x (**times**) not %*

<details style="padding-left: 32px; border-left: 4px solid gray;">
<summary>Benchmark results.</summary>
<p>

```
❯ yarn benchmark
Joi x 123,593 ops/sec ±0.60% (94 runs sampled)
Superstruct x 87,898 ops/sec ±0.33% (92 runs sampled)
Zod x 3,498 ops/sec ±1.15% (91 runs sampled)
ow x 5,533 ops/sec ±0.93% (85 runs sampled)
SureType x 8,982,429 ops/sec ±0.53% (91 runs sampled)
-----
73x faster than Joi
102x faster than Superstruct
2568x faster than Zod
1623x faster than ow
```

</p>
</details>

It supports most (if not all) of JSON schema, and *nothing beyond that*, so that the validator schemas written in TypeScript (or JavaScript) can be ensured to be convertible into JSON schema. This also prevents suretype from becoming feature bloated - it has a small and extremely simple API.

Errors are prettified using [awesome-ajv-errors][awesome-ajv-errors-url].

From a validator schema defined with suretype, you can trivially:

 * Compile a validator function (using the **very** fast [Ajv](https://www.npmjs.com/package/ajv))
 * Extract the corresponding JSON Schema
 * Deduce a TypeScript type corresponding to the validator schema (at compile-time!)
 * Using [typeconv](https://github.com/grantila/typeconv):
   * [Export](#exporting-using-typeconv) (convert) the validator schema into JSON Schema, Open API, TypeScript types or GraphQL, or;
   * The opposite (!); convert JSON Schema, Open API, TypeScript types or GraphQL **into** suretype validators! 🎉

The above makes it ideal in TypeScript environments. When used in RESTful applications, the exported schema can be used to document the APIs using OpenAPI. When used in libraries / clients, the TypeScript interfaces can be extracted to well-documented standalone files (including JSDoc comments).


## Versions

 * Since version 3;
   * This is a [pure ESM][pure-esm] package. It requires at least Node 14.13.1, and cannot be used from CommonJS.
   * This package **can** be used in browsers without special hacks. It will not pretty-print codeframes or use colors if the bundling setup doesn't support it, but will to try to load support for it.
   * You can control colorized/stylized output globally or per validator
 * Since version 4;
   *  Inverted required/optional; Schemas now default to required fields, so `.required()` is removed. To have fields optional, use `.optional()`.


# Minimal example

The following is a validator schema using suretype:

```ts
import { v } from "suretype"

const userSchema = v.object( {
    firstName: v.string( ),
    lastName: v.string( ).optional( ),
    age: v.number( ).gte( 21 ).optional( ),
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

Note the `?` for the optional properties, i.e. those that are followed by `optional()`.

There are three ways of compiling a validator function; choose the one that best fits your application and situation. Given:

```ts
import { compile } from "suretype"

const data = ... // get data from somewhere, e.g. as a TypeScript unknown
```


## Standard validator

The default behaviour of `compile` is to return a validator function returning extended Ajv output.

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


## Validate or ensure without compiling

Instead of creating a validator from `compile`, you can use the shorthands `validate`, `isValid` and `ensure`. They correspond to compiling without options, compiling in simple-mode and in ensure-mode.

```ts
import { validate, isValid, ensure } from 'suretype'

const validation = validate( userSchema, data ); // -> Validation object
const isUser = isValid( userSchema, data );      // -> Type-guarded boolean
const user = ensure( userSchema, data );         // -> user is data of type userSchema
```


## Raw JSON Schema validator

Sometimes it's handy to not describe the validator schema programmatically, but rather use a raw JSON Schema. There will be no type deduction, so the corresponding interface must be provided explicitly. Only use this if you know the JSON Schema maps to the interface! `raw` works just like the `v.*` functions and returns a validator schema. It can also be annotated.

```ts
import { raw, compile } from 'suretype'

type User = ...; // Get this type from somewhere
const userSchema = raw< User >( { type: 'object', properties: { /* ... */ } } );

// Compile as usual
const ensureUser = compile( userSchema, { ensure: true } );
```


## Configure

You can configure colorization and styling, instead of relying on support detection.

Either globally:
```ts
import { setSuretypeOptions } from 'suretype'

setSuretypeOptions( {
    colors: true | false,
    location: true | false,
    bigNumbers: true | false,
} );
```

and/or per validator, e.g.:
```ts
import { compile } from 'suretype'

const ensureThing = compile(
    schemaThing,
    { ensure: true, color: true, location: false }
);
```


# Annotating schemas

You can annotate a validator schema using `suretype()` or `annotate()`. The return value is still a validator schema, but when exporting it, the annotations will be included.

The difference between `suretype()` and `annotate()` is that `suretype()` requires the `name` property, where as it's optional in `annotate()`. Use `suretype()` to annotate top-level schemas so that they have proper names in the corresponding JSON Schema.

Annotations are useful when exporting the schema to other formats (e.g. JSON Schema or pretty TypeScript interfaces).

```ts
import { suretype, annotate, v } from "suretype"

const cartItemSchema = suretype(
    // Annotations
    { name: "CartItem" },
    // The validator schema
    v.object( {
        productId: annotate( { title: "The product id string" }, v.string( ) ),
        // ...
    } )
);
```

The interface (i.e. the fields you can use) is called `Annotations`:

```ts
interface Annotations {
	name: string;
	title?: string;
	description?: string;
	examples?: Array< string >;
}
```

where only the `name` is required.


# Thorough example

The following are two types, one using (or *depending on*) the other. They are *named*, which will be reflected in the JSON schema, shown below.

The `userSchema` is the same as in the above example, although it's wrapped in `suretype()` which annotates it with a name and other attributes.

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
        firstName: v.string( ),
        lastName: v.string( ).optional( ),
        age: v.number( ).gte( 21 ).optional( ),
    } )
);

const messageSchema = suretype(
    {
        name: "V1Message",
        title: "A message from a certain user",
    },
    v.object( {
        user: userSchema,
        line: v.string( ),
    } )
);
```

</p>
</details>

The JSON schema for these can be extracted, either each type by itself:

```ts
import { extractSingleJsonSchema } from "suretype"

// The JSON schema for User
const { schema: jsonSchema } = extractSingleJsonSchema( userSchema );
```

or as all types at once, into one big JSON schema. In this case, all validation schemas provided **must** be wrapped with `suretype()`, as they will become JSON schema *"definitions"* and therefore must have at least a name.

```ts
import { extractJsonSchema } from "suretype"

const { schema: jsonSchema, lookup, schemaRefName } =
    extractJsonSchema( [ userSchema, messageSchema ], { /* opts... */ } );
```

An optional second argument can be provided on the form:

```ts
interface ExtractJsonSchemaOptions {
    refMethod?: ExportRefMethod;
    onTopLevelNameConflict?: OnTopLevelNameConflict;
    onNonSuretypeValidator?: OnNonSuretypeValidator;
}
```

The `ExportRefMethod` type is a string union defined as:
```ts
    | 'no-refs'  // Don't ref anything. Inline all types to monolith types.
    | 'provided' // Reference types that are explicitly provided.
    | 'ref-all'  // Ref all provided types and those with names, suretype()'d.
```

The `OnTopLevelNameConflict` type is a string union defined as:
```ts
    | 'error'  // Fail the operation
    | 'rename' // Rename the validators to a unique name
```

The `OnNonSuretypeValidator` type is a string union defined as:
```ts
    | 'error'       // Fail the operation
    | 'ignore'      // Ignore, don't export
    | 'create-name' // Create a name 'Unknown'
    | 'lookup'      // Provide in lookup table
```

If `lookup` is specified, it allows unnamed validators. They won't exist in the resulting schema, but in a lookup table next to it. This lookup table will always exist, using this setting will simply allow unnamed validators.

The result is an object on the form:

```ts
interface ExtractedJsonSchema {
    schema: SchemaWithDefinitions; // Contains a 'definitions' property
    lookup: Map< CoreValidator< unknown >, any >;
    schemaRefName: Map< any, string >;
}
```

The `lookup` is useful to lookup the json schema for a certain validator object reference, especially unnamed ones which are not included in the schema.

The `schemaRefName` contains a lookup map from (top-level) schema object to its name as used when referring to it, not necessarily the same as what it is internally named, if there where naming conflicts and `OnTopLevelNameConflict` is `rename`.

In the example above, the `jsonSchema` *object* (which can be `JSON.stringify`'d) will be something like:

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


### Exporting using typeconv

<img src="https://raw.githubusercontent.com/grantila/suretype/master/.github/images/suretype-typeconv.svg" width="25%" />

A better (well, often much more practical) way of converting suretype validator schemas into JSON Schema is by using [`typeconv`][typeconv-github-url] [![npm version][typeconv-image]][typeconv-npm-url].

You can convert from suretype validator schemas to:
 * TypeScript interfaces (pretty printed with JSDoc comments)
 * JSON Schema
 * Open API
 * GraphQL

When converting **from** suretype, typeconv will convert all *exported* validator schemas from the source files.

Example *from* SureType *to* TypeScript; `$ npx typeconv -f st -t ts -o generated 'src/validators/**/*.ts'`

You can also convert **from** any of these formats ***into*** suretype validators!

Example *from* Open API *to* SureType; `$ npx typeconv -f oapi -t st -o generated 'schemas/**/*.yml'`


[npm-image]: https://img.shields.io/npm/v/suretype.svg
[npm-url]: https://npmjs.org/package/suretype
[downloads-image]: https://img.shields.io/npm/dm/suretype.svg
[build-image]: https://img.shields.io/github/actions/workflow/status/grantila/suretype/master.yml?branch=master
[build-url]: https://github.com/grantila/suretype/actions?query=workflow%3AMaster
[coverage-image]: https://coveralls.io/repos/github/grantila/suretype/badge.svg?branch=master
[coverage-url]: https://coveralls.io/github/grantila/suretype?branch=master
[node-version]: https://img.shields.io/node/v/suretype
[node-url]: https://nodejs.org/en/
[awesome-ajv-errors-url]: https://github.com/grantila/awesome-ajv-errors

[typeconv-image]: https://img.shields.io/npm/v/typeconv.svg
[typeconv-github-url]: https://github.com/grantila/typeconv
[typeconv-npm-url]: https://npmjs.org/package/typeconv
[pure-esm]: https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c
