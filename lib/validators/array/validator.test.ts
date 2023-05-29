import { ArrayValidator } from "./validator.js"
import { validatorType } from "../../validation.js"
import { validateJsonSchema, validate } from "../../json-schema.js"
import { AnyValidator } from "../any/validator";
import { AnyOfValidator } from "../or/validator.js"
import { StringValidator } from "../string/validator.js"
import { BooleanValidator } from "../boolean/validator.js"
import { extractSingleJsonSchema } from "../../extract-json-schema.js"
import { RawValidator } from "../raw/validator.js"


describe( "ArrayValidator", ( ) =>
{
	it( "Correct type", ( ) =>
	{
		const validator = new ArrayValidator( new AnyValidator( ) );
		expect( validatorType( validator ) ).toEqual( "array" );
	} );

	it( "Valid schema with generic items", ( ) =>
	{
		const validator = new ArrayValidator( new StringValidator( ) );

		const { schema } = extractSingleJsonSchema( validator );

		expect( schema ).toEqual( {
			type: "array",
			items: { type: "string" },
		} );

		expect( validateJsonSchema( schema ).ok ).toEqual( true );
		expect( validate( validator, true ).ok ).toEqual( false );
		expect( validate( validator, "foo" ).ok ).toEqual( false );
		expect( validate( validator, 3.14 ).ok ).toEqual( false );
		expect( validate( validator, { } ).ok ).toEqual( false );
		expect( validate( validator, [ ] ).ok ).toEqual( true );
		expect( validate( validator, [ "foo" ] ).ok ).toEqual( true );
		expect( validate( validator, [ "foo", 42 ] ).ok ).toEqual( false );
		expect( validate( validator, [ 42 ] ).ok ).toEqual( false );
	} );

	it( "Valid schema with 2 items, and additional, different types", ( ) =>
	{
		const validator =
			new ArrayValidator( new StringValidator( ) )
			.enum( [ "foo" ], [ "bar", "baz" ] );

		const { schema } = extractSingleJsonSchema( validator );

		expect( schema ).toEqual( {
			type: "array",
			items: { type: "string" },
			enum: [
				[ "foo" ],
				[ "bar", "baz" ],
			],
		} );

		expect( validateJsonSchema( schema ).ok ).toEqual( true );
		expect( validate( validator, true ).ok ).toEqual( false );
		expect( validate( validator, "foo" ).ok ).toEqual( false );
		expect( validate( validator, 3.14 ).ok ).toEqual( false );
		expect( validate( validator, { } ).ok ).toEqual( false );
		expect( validate( validator, [ ] ).ok ).toEqual( false );
		expect( validate( validator, [ "foo", "baz" ] ).ok ).toEqual( false );
		expect( validate( validator, [ "bar" ] ).ok ).toEqual( false );
		expect( validate( validator, [ "baz" ] ).ok ).toEqual( false );
		expect( validate( validator, [ "foo" ] ).ok ).toEqual( true );
		expect( validate( validator, [ "bar", "baz" ] ).ok ).toEqual( true );
		expect( validate( validator, [ "foo", true ] ).ok ).toEqual( false );
	} );

	it( "Valid schema with minItems", ( ) =>
	{
		const validator =
			new ArrayValidator(
				new AnyOfValidator( [
					new StringValidator( ),
					new BooleanValidator( ).optional( )
				] )
			)
			.minItems( 3 );

		const { schema } = extractSingleJsonSchema( validator );
		expect( schema ).toEqual( {
			type: "array",
			items: { anyOf: [ { type: "string" }, { type: "boolean" } ] },
			minItems: 3,
		} );

		expect( validateJsonSchema( schema ).ok ).toEqual( true );
		expect( validate( validator, true ).ok ).toEqual( false );
		expect( validate( validator, "foo" ).ok ).toEqual( false );
		expect( validate( validator, 3.14 ).ok ).toEqual( false );
		expect( validate( validator, { } ).ok ).toEqual( false );
		expect( validate( validator, [ ] ).ok ).toEqual( false );
		expect( validate( validator, [ "foo" ] ).ok ).toEqual( false );
		expect( validate( validator, [ "foo", 42 ] ).ok ).toEqual( false );
		expect( validate( validator, [ "foo", true ] ).ok ).toEqual( false );
		expect( validate( validator, [ "foo", false, true ] ).ok )
			.toEqual( true );
		expect( validate( validator, [ "foo", false, true, false ] ).ok )
			.toEqual( true );
	} );


	it( "Valid schema with minItems and maxItems", ( ) =>
	{
		const validator =
			new ArrayValidator( new StringValidator( ) )
			.minItems( 2 )
			.maxItems( 3 );

		const { schema } = extractSingleJsonSchema( validator );
		expect( schema ).toEqual( {
			type: "array",
			items: { type: "string" },
			minItems: 2,
			maxItems: 3,
		} );

		expect( validateJsonSchema( schema ).ok ).toEqual( true );
		expect( validate( validator, true ).ok ).toEqual( false );
		expect( validate( validator, "foo" ).ok ).toEqual( false );
		expect( validate( validator, 3.14 ).ok ).toEqual( false );
		expect( validate( validator, { } ).ok ).toEqual( false );
		expect( validate( validator, [ ] ).ok ).toEqual( false );
		expect( validate( validator, [ "foo" ] ).ok ).toEqual( false );
		expect( validate( validator, [ "foo", 42 ] ).ok ).toEqual( false );
		expect( validate( validator, [ "foo", "bar" ] ).ok ).toEqual( true );
		expect( validate( validator, [ "foo", "bar", "baz" ] ).ok )
			.toEqual( true );
		expect( validate( validator, [ "foo", "bar", "baz", "bak" ] ).ok )
			.toEqual( false );
	} );

	it( "Valid schema with minItems > maxItems", ( ) =>
	{
		expect( ( ) =>
			new ArrayValidator( new StringValidator( ) )
			.minItems( 2 )
			.maxItems( 1 )
		).toThrow( "cannot be smaller" );

		expect( ( ) =>
			new ArrayValidator( new StringValidator( ) )
			.maxItems( 1 )
			.minItems( 2 )
		).toThrow( "cannot be larger" );
	} );

	it( "Valid schema with contains", ( ) =>
	{
		const validator =
			new ArrayValidator( new StringValidator( ) )
			.contains( new StringValidator( ).const( "foo" ) );

		const { schema } = extractSingleJsonSchema( validator );
		expect( schema ).toEqual( {
			type: "array",
			items: { type: "string" },
			contains: { type: "string", const: "foo" },
		} );

		expect( validateJsonSchema( schema ).ok ).toEqual( true );
		expect( validate( validator, true ).ok ).toEqual( false );
		expect( validate( validator, "foo" ).ok ).toEqual( false );
		expect( validate( validator, 3.14 ).ok ).toEqual( false );
		expect( validate( validator, { } ).ok ).toEqual( false );
		expect( validate( validator, [ ] ).ok ).toEqual( false );
		expect( validate( validator, [ "foo" ] ).ok ).toEqual( true );
		expect( validate( validator, [ "foo", "bar" ] ).ok ).toEqual( true );
		expect( validate( validator, [ "bar", "baz" ] ).ok ).toEqual( false );
	} );

	it( "Valid schema with unique", ( ) =>
	{
		const validator =
			new ArrayValidator( new StringValidator( ) ).unique( );

		const { schema } = extractSingleJsonSchema( validator );
		expect( schema ).toEqual( {
			type: "array",
			items: { type: "string" },
			uniqueItems: true,
		} );

		expect( validateJsonSchema( schema ).ok ).toEqual( true );
		expect( validate( validator, true ).ok ).toEqual( false );
		expect( validate( validator, "foo" ).ok ).toEqual( false );
		expect( validate( validator, 3.14 ).ok ).toEqual( false );
		expect( validate( validator, { } ).ok ).toEqual( false );
		expect( validate( validator, [ ] ).ok ).toEqual( true );
		expect( validate( validator, [ "foo" ] ).ok ).toEqual( true );
		expect( validate( validator, [ "foo", 42 ] ).ok ).toEqual( false );
		expect( validate( validator, [ "foo", "bar" ] ).ok ).toEqual( true );
		expect( validate( validator, [ "foo", "bar", "bar" ] ).ok )
			.toEqual( false );
	} );

	it( "Valid schema with raw", ( ) =>
	{
		const validator =
			new ArrayValidator(
				new AnyOfValidator( [
					new StringValidator( ),
					new RawValidator( { type: "boolean" } ).optional( )
				] )
			)
			.minItems( 3 );

		const { schema } = extractSingleJsonSchema( validator );
		expect( schema ).toEqual( {
			type: "array",
			items: { anyOf: [ { type: "string" }, { type: "boolean" } ] },
			minItems: 3,
		} );

		expect( validateJsonSchema( schema ).ok ).toEqual( true );
		expect( validate( validator, true ).ok ).toEqual( false );
		expect( validate( validator, "foo" ).ok ).toEqual( false );
		expect( validate( validator, 3.14 ).ok ).toEqual( false );
		expect( validate( validator, { } ).ok ).toEqual( false );
		expect( validate( validator, [ ] ).ok ).toEqual( false );
		expect( validate( validator, [ "foo" ] ).ok ).toEqual( false );
		expect( validate( validator, [ "foo", 42 ] ).ok ).toEqual( false );
		expect( validate( validator, [ "foo", true ] ).ok ).toEqual( false );
		expect( validate( validator, [ "foo", false, true ] ).ok )
			.toEqual( true );
		expect( validate( validator, [ "foo", false, true, false ] ).ok )
			.toEqual( true );
	} );
} );
