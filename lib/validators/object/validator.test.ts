import { ObjectValidator } from "./validator.js"
import { validatorType } from "../../validation.js"
import { validateJsonSchema, validate, ensure } from "../../json-schema.js"
import { RawValidator } from "../raw/validator.js"
import { NumberValidator } from "../number/validator.js"
import { StringValidator } from "../string/validator.js"
import { BooleanValidator } from "../boolean/validator.js"
import { IfValidator } from "../if/validator.js"
import { extractSingleJsonSchema } from "../../extract-json-schema.js"
import { TypeOf } from "../functional.js"
import { v } from "../../api/index.js"


describe( "ObjectValidator", ( ) =>
{
	it( "Correct type", ( ) =>
	{
		const validator = new ObjectValidator( { } );
		expect( validatorType( validator ) ).toEqual( "object" );
	} );

	it( "Valid schema without properties", ( ) =>
	{
		const validator = new ObjectValidator( { } );
		const { schema } = extractSingleJsonSchema( validator );

		expect( schema ).toEqual( {
			type: "object",
		} );

		expect( validateJsonSchema( schema ).ok ).toEqual( true );
		expect( validate( validator, true ).ok ).toEqual( false );
		expect( validate( validator, "foo" ).ok ).toEqual( false );
		expect( validate( validator, 3.14 ).ok ).toEqual( false );
		expect( validate( validator, { } ).ok ).toEqual( true );
		expect( validate( validator, { foo: "bar" } ).ok ).toEqual( true );
	} );

	it( "Valid schema without properties and without additional", ( ) =>
	{
		const validator = new ObjectValidator( { } ).additional( false );
		const { schema } = extractSingleJsonSchema( validator );

		expect( schema ).toEqual( {
			type: "object",
			additionalProperties: false,
		} );

		expect( validateJsonSchema( schema ).ok ).toEqual( true );
		expect( validate( validator, true ).ok ).toEqual( false );
		expect( validate( validator, "foo" ).ok ).toEqual( false );
		expect( validate( validator, 3.14 ).ok ).toEqual( false );
		expect( validate( validator, { } ).ok ).toEqual( true );
		expect( validate( validator, { foo: "bar" } ).ok ).toEqual( false );
	} );

	it( "Valid schema without properties, but additional (unknown)", ( ) =>
	{
		const validator = new ObjectValidator( { } )
			.additional( true );
		const { schema } = extractSingleJsonSchema( validator );

		expect( schema ).toEqual( {
			type: "object",
			additionalProperties: true,
		} );

		expect( validateJsonSchema( schema ).ok ).toEqual( true );
		expect( validate( validator, true ).ok ).toEqual( false );
		expect( validate( validator, "foo" ).ok ).toEqual( false );
		expect( validate( validator, 3.14 ).ok ).toEqual( false );
		expect( validate( validator, { } ).ok ).toEqual( true );
		expect( validate( validator, { foo: "bar" } ).ok ).toEqual( true );
	} );

	it( "Valid schema without properties, but additional (specific)", ( ) =>
	{
		const validator = new ObjectValidator( { } )
			.additional( new NumberValidator( ).enum( 1, 2 ) );
		const { schema } = extractSingleJsonSchema( validator );

		expect( schema ).toEqual( {
			type: "object",
			additionalProperties: { type: "number", enum: [ 1, 2 ] },
		} );

		expect( validateJsonSchema( schema ).ok ).toEqual( true );
		expect( validate( validator, true ).ok ).toEqual( false );
		expect( validate( validator, "foo" ).ok ).toEqual( false );
		expect( validate( validator, 1 ).ok ).toEqual( false );
		expect( validate( validator, 3.14 ).ok ).toEqual( false );
		expect( validate( validator, { } ).ok ).toEqual( true );
		expect( validate( validator, { foo: "bar" } ).ok ).toEqual( false );
		expect( validate( validator, { foo: 0 } ).ok ).toEqual( false );
		expect( validate( validator, { foo: 1 } ).ok ).toEqual( true );
		expect( validate( validator, { foo: 2 } ).ok ).toEqual( true );
		expect( validate( validator, { foo: 3 } ).ok ).toEqual( false );
	} );

	it( "Valid schema with properties (no additional)", ( ) =>
	{
		const validator =
			new ObjectValidator( {
				foo: new StringValidator( ).enum( "bar", "baz" ),
				num: new NumberValidator( ).enum( 17, 42 ),
			} )
			.additional( false );
		const { schema } = extractSingleJsonSchema( validator );

		expect( schema ).toEqual( {
			type: "object",
			properties: {
				foo: { type: "string", enum: [ "bar", "baz" ] },
				num: { type: "number", enum: [ 17, 42 ] },
			},
			required: [ "foo", "num" ],
			additionalProperties: false,
		} );

		expect( validateJsonSchema( schema ).ok ).toEqual( true );
		expect( validate( validator, true ).ok ).toEqual( false );
		expect( validate( validator, "foo" ).ok ).toEqual( false );
		expect( validate( validator, 3.14 ).ok ).toEqual( false );
		expect( validate( validator, {
			foo: "bar",
			num: 18,
		} ).ok ).toEqual( false );
		expect( validate( validator, {
			foo: "bak",
			num: 17,
		} ).ok ).toEqual( false );
		expect( validate( validator, {
			foo: "bar",
			num: 17,
			else: true,
		} ).ok ).toEqual( false );
		expect( validate( validator, {
			foo: "bar",
			num: 17,
		} ).ok ).toEqual( true );
	} );

	it( "Valid schema with properties (additional = true)", ( ) =>
	{
		const validator =
			v.object( {
				foo: new StringValidator( ).enum( "bar", "baz" ),
				num: new NumberValidator( ).enum( 17, 42 ).optional( ),
			} )
			.additional( true );
		type T = TypeOf< typeof validator >;
		const { schema } = extractSingleJsonSchema( validator );

		expect( schema ).toEqual( {
			type: "object",
			properties: {
				foo: { type: "string", enum: [ "bar", "baz" ] },
				num: { type: "number", enum: [ 17, 42 ] },
			},
			required: [ "foo" ],
			additionalProperties: true,
		} );

		expect( validateJsonSchema( schema ).ok ).toEqual( true );
		expect( validate( validator, true ).ok ).toEqual( false );
		expect( validate( validator, "foo" ).ok ).toEqual( false );
		expect( validate( validator, 3.14 ).ok ).toEqual( false );
		expect( validate( validator, {
			foo: "bar",
			num: 18,
		} ).ok ).toEqual( false );
		expect( validate( validator, {
			foo: "bak",
			num: 17,
		} ).ok ).toEqual( false );
		expect( validate( validator, {
			foo: "bar",
			num: 17,
			else: true,
		} ).ok ).toEqual( true );

		const fn = ( _val: { foo: string; num?: number; } ) => { };
		const val: T = {
			foo: "bar",
			num: 17,
		};
		fn( val ); // Tests type usage at compile-time
		expect( validate( validator, val ).ok ).toEqual( true );
	} );

	it( "Valid schema with properties (additional = v.boolean())", ( ) =>
	{
		const validator =
			v.object( {
				foo: new StringValidator( ).enum( "bar", "baz" ),
				num: new NumberValidator( ).enum( 17, 42 ).optional( ),
				obj: v.object( {
					p: new StringValidator( ).optional( )
				} ).optional( ),
			} )
			.additional( new BooleanValidator( ) );
		type T = TypeOf< typeof validator >;
		const { schema } = extractSingleJsonSchema( validator );

		expect( schema ).toEqual( {
			type: "object",
			properties: {
				foo: { type: "string", enum: [ "bar", "baz" ] },
				num: { type: "number", enum: [ 17, 42 ] },
				obj: {
					type: "object",
					properties: {
						p: { type: "string" },
					},
				},
			},
			required: [ "foo" ],
			additionalProperties: { type: 'boolean' },
		} );

		expect( validateJsonSchema( schema ).ok ).toEqual( true );
		expect( validate( validator, true ).ok ).toEqual( false );
		expect( validate( validator, "foo" ).ok ).toEqual( false );
		expect( validate( validator, 3.14 ).ok ).toEqual( false );
		expect( validate( validator, {
			foo: "bar",
			num: 18,
		} ).ok ).toEqual( false );
		expect( validate( validator, {
			foo: "bak",
			num: 17,
		} ).ok ).toEqual( false );
		expect( validate( validator, {
			foo: "bar",
			num: 17,
			else: "true",
		} ).ok ).toEqual( false );
		expect( validate( validator, {
			foo: "bar",
			num: 17,
			else: true,
		} ).ok ).toEqual( true );

		const fn = ( _val: { foo: string; num?: number; } ) => { };
		const val: T = {
			foo: "bar",
			num: 17,
		};
		val.foo;
		val.xxx;
		fn( val ); // Tests type usage at compile-time
		expect( validate( validator, val ).ok ).toEqual( true );
	} );

	it( "Valid schema with properties, additional, enum (all raw)", ( ) =>
	{
		const validator =
			v.object( {
				foo: new RawValidator( {
					type: "string", enum: [ "bar", "baz" ]
				} ),
				num: new NumberValidator( ).enum( 17, 42 ).optional( ),
				obj: v.object( {
					p: new RawValidator( { type: "string" } ).optional( )
				} ).optional( ),
			} )
			.additional( new RawValidator( { type: "boolean" } ) );
		const { schema } = extractSingleJsonSchema( validator );

		expect( schema ).toEqual( {
			type: "object",
			properties: {
				foo: { type: "string", enum: [ "bar", "baz" ] },
				num: { type: "number", enum: [ 17, 42 ] },
				obj: {
					type: "object",
					properties: {
						p: { type: "string" },
					},
				},
			},
			required: [ "foo" ],
			additionalProperties: { type: 'boolean' },
		} );

		expect( validateJsonSchema( schema ).ok ).toEqual( true );
		expect( validate( validator, true ).ok ).toEqual( false );
		expect( validate( validator, "foo" ).ok ).toEqual( false );
		expect( validate( validator, 3.14 ).ok ).toEqual( false );
		expect( validate( validator, {
			foo: "bar",
			num: 18,
		} ).ok ).toEqual( false );
		expect( validate( validator, {
			foo: "bak",
			num: 17,
		} ).ok ).toEqual( false );
		expect( validate( validator, {
			foo: "bar",
			num: 17,
			else: "true",
		} ).ok ).toEqual( false );
		expect( validate( validator, {
			foo: "bar",
			num: 17,
			else: true,
		} ).ok ).toEqual( true );

		const val = {
			foo: "bar",
			num: 17,
		};
		expect( validate( validator, val ).ok ).toEqual( true );
	} );

	it( "Valid schema with enum", ( ) =>
	{
		const validator =
			new ObjectValidator( {
				foo: new StringValidator( ).enum( "bar", "baz" ),
				num: new NumberValidator( ).enum( 17, 42 ).optional( ),
			} )
			.additional( false )
			.enum( { foo: "bar", num: 42 }, { foo: "baz", num: 17 } );
		const { schema } = extractSingleJsonSchema( validator );

		expect( schema ).toEqual( {
			type: "object",
			properties: {
				foo: { type: "string", enum: [ "bar", "baz" ] },
				num: { type: "number", enum: [ 17, 42 ] },
			},
			additionalProperties: false,
			required: [ "foo" ],
			enum: [ { foo: "bar", num: 42 }, { foo: "baz", num: 17 } ],
		} );

		expect( validateJsonSchema( schema ).ok ).toEqual( true );
		expect( validate( validator, true ).ok ).toEqual( false );
		expect( validate( validator, "foo" ).ok ).toEqual( false );
		expect( validate( validator, 3.14 ).ok ).toEqual( false );
		expect( validate( validator, {
			foo: "bar",
			num: 18,
		} ).ok ).toEqual( false );
		expect( validate( validator, {
			foo: "bak",
			num: 17,
		} ).ok ).toEqual( false );
		expect( validate( validator, {
			foo: "bar",
			num: 17,
			else: true,
		} ).ok ).toEqual( false );
		// Not in enum
		expect( validate( validator, {
			foo: "bar",
			num: 17,
		} ).ok ).toEqual( false );
		expect( validate( validator, {
			foo: "baz",
			num: 42,
		} ).ok ).toEqual( false );
		// In enum
		expect( validate( validator, {
			foo: "bar",
			num: 42,
		} ).ok ).toEqual( true );
		expect( validate( validator, {
			foo: "baz",
			num: 17,
		} ).ok ).toEqual( true );
	} );

	it( "Valid schema with properties and additional (any)", ( ) =>
	{
		const validator =
			new ObjectValidator( {
				foo: new StringValidator( ).enum( "bar", "baz" ).optional( ),
				num: new NumberValidator( ).enum( 17, 42 ).optional( ),
			} )
			.additional( true );
		const { schema } = extractSingleJsonSchema( validator );

		expect( schema ).toEqual( {
			type: "object",
			properties: {
				foo: { type: "string", enum: [ "bar", "baz" ] },
				num: { type: "number", enum: [ 17, 42 ] },
			},
			additionalProperties: true,
		} );

		expect( validateJsonSchema( schema ).ok ).toEqual( true );
		expect( validate( validator, true ).ok ).toEqual( false );
		expect( validate( validator, "foo" ).ok ).toEqual( false );
		expect( validate( validator, 3.14 ).ok ).toEqual( false );
		expect( validate( validator, { } ).ok ).toEqual( true );
		expect( validate( validator, {
			foo: "bar",
			num: 18,
			else: true,
		} ).ok ).toEqual( false );
		expect( validate( validator, {
			foo: "bak",
			num: 17,
			else: true,
		} ).ok ).toEqual( false );
		expect( validate( validator, {
			foo: "bar",
			num: 17,
			else: true,
		} ).ok ).toEqual( true );
	} );

	it( "Valid schema with properties and additional (specific)", ( ) =>
	{
		const validator =
			new ObjectValidator( {
				foo: new StringValidator( ).enum( "bar", "baz" ).optional( ),
				num: new NumberValidator( ).enum( 17, 42 ).optional( ),
			} )
			.additional( new NumberValidator( ).enum( 1, 2 ) );
		const { schema } = extractSingleJsonSchema( validator );

		expect( schema ).toEqual( {
			type: "object",
			properties: {
				foo: { type: "string", enum: [ "bar", "baz" ] },
				num: { type: "number", enum: [ 17, 42 ] },
			},
			additionalProperties: { type: "number", enum: [ 1, 2 ] },
		} );

		expect( validateJsonSchema( schema ).ok ).toEqual( true );
		expect( validate( validator, true ).ok ).toEqual( false );
		expect( validate( validator, "foo" ).ok ).toEqual( false );
		expect( validate( validator, 1 ).ok ).toEqual( false );
		expect( validate( validator, 3.14 ).ok ).toEqual( false );
		expect( validate( validator, { } ).ok ).toEqual( true );
		expect( validate( validator, {
			foo: "bar",
			num: 18,
			else: true,
		} ).ok ).toEqual( false );
		expect( validate( validator, {
			foo: "bak",
			num: 17,
			else: true,
		} ).ok ).toEqual( false );
		expect( validate( validator, {
			foo: "bar",
			num: 17,
			else: true,
		} ).ok ).toEqual( false );
		expect( validate( validator, {
			foo: "bar",
			num: 17,
			else: 3.14,
		} ).ok ).toEqual( false );
		expect( validate( validator, {
			foo: "bar",
			num: 17,
			else: 2,
		} ).ok ).toEqual( true );
		expect( validate( validator, {
			foo: "bar",
			num: 17,
		} ).ok ).toEqual( true );
	} );

	it( "Valid schema with some required properties", ( ) =>
	{
		const validator =
			new ObjectValidator( {
				foo: new StringValidator( ).enum( "bar", "baz" ),
				num: new NumberValidator( ).enum( 17, 42 ).optional( ),
			} )
			.additional( false );
		const { schema } = extractSingleJsonSchema( validator );

		expect( schema ).toEqual( {
			type: "object",
			properties: {
				foo: { type: "string", enum: [ "bar", "baz" ] },
				num: { type: "number", enum: [ 17, 42 ] },
			},
			required: [ "foo" ],
			additionalProperties: false,
		} );

		expect( validateJsonSchema( schema ).ok ).toEqual( true );
		expect( validate( validator, true ).ok ).toEqual( false );
		expect( validate( validator, "foo" ).ok ).toEqual( false );
		expect( validate( validator, 3.14 ).ok ).toEqual( false );
		expect( validate( validator, { } ).ok ).toEqual( false );
		expect( validate( validator, {
			foo: "bar",
			num: 18,
		} ).ok ).toEqual( false );
		expect( validate( validator, {
			foo: "bak",
			num: 17,
		} ).ok ).toEqual( false );
		expect( validate( validator, {
			foo: "bar",
			num: 17,
		} ).ok ).toEqual( true );
		expect( validate( validator, {
			foo: "bar",
		} ).ok ).toEqual( true );
		expect( validate( validator, {
			num: 17,
		} ).ok ).toEqual( false );
	} );

	it( "Valid schema with allOf", ( ) =>
	{
		const validator =
			new ObjectValidator( {
				foo: new StringValidator( ).optional( ),
				num: new NumberValidator( ).optional( ),
			} )
			.allOf( o => [
				new IfValidator(
					new ObjectValidator( {
						foo: new StringValidator( ).enum( "bar" ).optional( ),
					} )
				).then( new ObjectValidator( {
					num: new NumberValidator( ).enum( 17 ).optional( ),
				} ) ),
				new IfValidator(
					new ObjectValidator( {
						foo: new StringValidator( ).enum( "baz" ).optional( ),
					} )
				).then( new ObjectValidator( {
					num: new NumberValidator( ).enum( 42 ).optional( ),
				} ) ),
			] );
		const { schema } = extractSingleJsonSchema( validator );

		expect( schema ).toEqual( {
			type: "object",
			properties: {
				foo: { type: "string" },
				num: { type: "number" },
			},
			allOf: [
				{
					if: {
						type: "object",
						properties: {
							foo: { type: "string", enum: [ "bar" ] },
						},
					},
					then: {
						type: "object",
						properties: {
							num: { type: "number", enum: [ 17 ] },
						},
					},
				},
				{
					if: {
						type: "object",
						properties: {
							foo: { type: "string", enum: [ "baz" ] },
						},
					},
					then: {
						type: "object",
						properties: {
							num: { type: "number", enum: [ 42 ] },
						},
					},
				},
			],
		} );

		expect( validateJsonSchema( schema ).ok ).toEqual( true );
		expect( validate( validator, true ).ok ).toEqual( false );
		expect( validate( validator, "foo" ).ok ).toEqual( false );
		expect( validate( validator, 3.14 ).ok ).toEqual( false );
		expect( validate( validator, { } ).ok ).toEqual( true );

		expect( validate( validator, {
			foo: "bar",
			num: 18,
		} ).ok ).toEqual( false );
		expect( validate( validator, {
			foo: "bar",
			num: 17,
		} ).ok ).toEqual( true );

		expect( validate( validator, {
			foo: "baz",
			num: 41,
		} ).ok ).toEqual( false );
		expect( validate( validator, {
			foo: "baz",
			num: 42,
		} ).ok ).toEqual( true );

		expect( validate( validator, {
			foo: "yada",
			num: 3.14,
		} ).ok ).toEqual( true );
	} );

	it( "Ensure right error message from awesome-ajv-errors", ( ) =>
	{
		const userSchema = v
			.object( {
				firstName: v.string( ),
			})
			.additional( v.number( ) );

		const user = {
			firstName: "Joe",
			otherThing: true,
		};

		try
		{
			ensure( userSchema, user ); // Will throw
		}
		catch ( err: any )
		{
			expect( err.explanation ).not.toContain( 'Invalid pointer-path' );
			expect( err.explanation ).toContain( 'value should be number' );
		}
	} );
} );
