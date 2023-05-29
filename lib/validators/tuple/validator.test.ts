import { TupleValidator } from "./validator.js"
import { validatorType } from "../../validation.js"
import { validateJsonSchema, validate } from "../../json-schema.js"
import { AnyValidator } from "../any/validator.js"
import { NumberValidator } from "../number/validator.js"
import { StringValidator } from "../string/validator.js"
import { BooleanValidator } from "../boolean/validator.js"
import { extractSingleJsonSchema } from "../../extract-json-schema.js"
import { RawValidator } from "../raw/validator.js"


describe( "TupleValidator", ( ) =>
{
	it( "Correct type", ( ) =>
	{
		const validator = new TupleValidator( [ new AnyValidator( ) ] );
		expect( validatorType( validator ) ).toEqual( "array" );
	} );

	it( "zero-sized array", ( ) =>
	{
		const validator = new TupleValidator( [ ] );
		const { schema } = extractSingleJsonSchema( validator );

		expect( schema ).toEqual( {
			type: "array",
			items: false,
			additionalItems: false,
		} );

		expect( validateJsonSchema( schema ).ok ).toEqual( true );
		expect( validate( validator, true ).ok ).toEqual( false );
		expect( validate( validator, "foo" ).ok ).toEqual( false );
		expect( validate( validator, 3.14 ).ok ).toEqual( false );
		expect( validate( validator, { } ).ok ).toEqual( false );
		expect( validate( validator, [ ] ).ok ).toEqual( true );
		expect( validate( validator, [ "foo" ] ).ok ).toEqual( false );
	} );

	it( "zero-sized array with additional", ( ) =>
	{
		const validator = new TupleValidator( [ ] ).additional( true );
		const { schema } = extractSingleJsonSchema( validator );

		expect( schema ).toEqual( {
			type: "array",
			items: true,
			additionalItems: true,
		} );

		expect( validateJsonSchema( schema ).ok ).toEqual( true );
		expect( validate( validator, true ).ok ).toEqual( false );
		expect( validate( validator, "foo" ).ok ).toEqual( false );
		expect( validate( validator, 3.14 ).ok ).toEqual( false );
		expect( validate( validator, { } ).ok ).toEqual( false );
		expect( validate( validator, [ ] ).ok ).toEqual( true );
		expect( validate( validator, [ "foo" ] ).ok ).toEqual( true );
	} );

	it( "Valid schema with one-sized array", ( ) =>
	{
		const validator = new TupleValidator( [ new AnyValidator( ) ] );
		const { schema } = extractSingleJsonSchema( validator );

		expect( schema ).toEqual( {
			type: "array",
			items: [ { } ],
			minItems: 1,
			additionalItems: false,
		} );

		expect( validateJsonSchema( schema ).ok ).toEqual( true );
		expect( validate( validator, true ).ok ).toEqual( false );
		expect( validate( validator, "foo" ).ok ).toEqual( false );
		expect( validate( validator, 3.14 ).ok ).toEqual( false );
		expect( validate( validator, { } ).ok ).toEqual( false );
		expect( validate( validator, [ ] ).ok ).toEqual( false );
		expect( validate( validator, [ "foo" ] ).ok ).toEqual( true );
	} );

	it( "Valid schema with one-sized (optional) array", ( ) =>
	{
		const validator = new TupleValidator( [
			new AnyValidator( ).optional( ),
		] );
		const { schema } = extractSingleJsonSchema( validator );

		expect( schema ).toEqual( {
			type: "array",
			items: [ { } ],
			additionalItems: false,
		} );

		expect( validateJsonSchema( schema ).ok ).toEqual( true );
		expect( validate( validator, true ).ok ).toEqual( false );
		expect( validate( validator, "foo" ).ok ).toEqual( false );
		expect( validate( validator, 3.14 ).ok ).toEqual( false );
		expect( validate( validator, { } ).ok ).toEqual( false );
		expect( validate( validator, [ ] ).ok ).toEqual( true );
		expect( validate( validator, [ "foo" ] ).ok ).toEqual( true );
	} );

	it( "Valid schema with 1 item, and no additional", ( ) =>
	{
		const validator = new TupleValidator( [ new StringValidator( ) ] );
		const { schema } = extractSingleJsonSchema( validator );

		expect( schema ).toEqual( {
			type: "array",
			items: [ { type: "string" } ],
			minItems: 1,
			additionalItems: false,
		} );

		expect( validateJsonSchema( schema ).ok ).toEqual( true );
		expect( validate( validator, true ).ok ).toEqual( false );
		expect( validate( validator, "foo" ).ok ).toEqual( false );
		expect( validate( validator, 3.14 ).ok ).toEqual( false );
		expect( validate( validator, { } ).ok ).toEqual( false );
		expect( validate( validator, [ ] ).ok ).toEqual( false );
		expect( validate( validator, [ "foo" ] ).ok ).toEqual( true );
		expect( validate( validator, [ "foo", 42 ] ).ok ).toEqual( false );
		expect( validate( validator, [ 42 ] ).ok ).toEqual( false );
	} );

	it( "Valid schema with 1 item, and additional (any)", ( ) =>
	{
		const validator = new TupleValidator( [ new StringValidator( ) ] )
			.additional( true );
		const { schema } = extractSingleJsonSchema( validator );

		expect( schema ).toEqual( {
			type: "array",
			items: [ { type: "string" } ],
			minItems: 1,
			additionalItems: true,
		} );

		expect( validateJsonSchema( schema ).ok ).toEqual( true );
		expect( validate( validator, true ).ok ).toEqual( false );
		expect( validate( validator, "foo" ).ok ).toEqual( false );
		expect( validate( validator, 3.14 ).ok ).toEqual( false );
		expect( validate( validator, { } ).ok ).toEqual( false );
		expect( validate( validator, [ ] ).ok ).toEqual( false );
		expect( validate( validator, [ "foo" ] ).ok ).toEqual( true );
		expect( validate( validator, [ "foo", 42 ] ).ok ).toEqual( true );
		expect( validate( validator, [ 42 ] ).ok ).toEqual( false );
	} );

	it( "Valid schema with 1 optional item, and no additional", ( ) =>
	{
		const validator = new TupleValidator( [
			new StringValidator( ).optional( )
		] );
		const { schema } = extractSingleJsonSchema( validator );

		expect( schema ).toEqual( {
			type: "array",
			items: [ { type: "string" } ],
			additionalItems: false,
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

	it( "Valid schema with 1 item, and additional (typed)", ( ) =>
	{
		const validator = new TupleValidator( [
			new StringValidator( )
		] )
			.additional( new NumberValidator( ) );
		const { schema } = extractSingleJsonSchema( validator );

		expect( schema ).toEqual( {
			type: "array",
			items: [ { type: "string" } ],
			minItems: 1,
			additionalItems: { type: "number" },
		} );

		expect( validateJsonSchema( schema ).ok ).toEqual( true );
		expect( validate( validator, true ).ok ).toEqual( false );
		expect( validate( validator, "foo" ).ok ).toEqual( false );
		expect( validate( validator, 3.14 ).ok ).toEqual( false );
		expect( validate( validator, { } ).ok ).toEqual( false );
		expect( validate( validator, [ ] ).ok ).toEqual( false );
		expect( validate( validator, [ "foo" ] ).ok ).toEqual( true );
		expect( validate( validator, [ "foo", 42 ] ).ok ).toEqual( true );
		expect( validate( validator, [ 42 ] ).ok ).toEqual( false );
	} );

	it( "Valid schema with 2 items, and additional, different types", ( ) =>
	{
		const validator = new TupleValidator( [
			new StringValidator( ),
			new NumberValidator( ).enum( 17, 42 ).optional( ),
		] )
		.additional( new BooleanValidator( ) );

		const { schema } = extractSingleJsonSchema( validator );

		expect( schema ).toEqual( {
			type: "array",
			items: [
				{ type: "string" },
				{ type: "number", enum: [ 17, 42 ] },
			],
			minItems: 1,
			additionalItems: { type: "boolean" },
		} );

		expect( validateJsonSchema( schema ).ok ).toEqual( true );
		expect( validate( validator, true ).ok ).toEqual( false );
		expect( validate( validator, "foo" ).ok ).toEqual( false );
		expect( validate( validator, 3.14 ).ok ).toEqual( false );
		expect( validate( validator, { } ).ok ).toEqual( false );
		expect( validate( validator, [ ] ).ok ).toEqual( false );
		expect( validate( validator, [ "foo" ] ).ok ).toEqual( true );
		expect( validate( validator, [ "foo", 42 ] ).ok ).toEqual( true );
		expect( validate( validator, [ "foo", true ] ).ok ).toEqual( false );
		expect( validate( validator, [ "foo", 42, true ] ).ok )
			.toEqual( true );
		expect( validate( validator, [ 42 ] ).ok ).toEqual( false );
	} );

	it( "Valid schema with minItems", ( ) =>
	{
		const validator = new TupleValidator( [
			new StringValidator( ),
			new NumberValidator( ).optional( ),
		] )
		.additional( new BooleanValidator( ) )
		.minItems( 3 );

		const { schema } = extractSingleJsonSchema( validator );
		expect( schema ).toEqual( {
			type: "array",
			items: [ { type: "string" }, { type: "number" } ],
			minItems: 3,
			additionalItems: { type: "boolean" },
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
		expect( validate( validator, [ "foo", 42, true ] ).ok )
			.toEqual( true );
		expect( validate( validator, [ "foo", 42, true, false ] ).ok )
			.toEqual( true );
	} );

	it( "Valid schema with maxItems", ( ) =>
	{
		const validator = new TupleValidator( [
			new StringValidator( ),
			new NumberValidator( ).optional( ),
		] )
		.additional( new BooleanValidator( ) )
		.maxItems( 3 );

		const { schema } = extractSingleJsonSchema( validator );
		expect( schema ).toEqual( {
			type: "array",
			items: [ { type: "string" }, { type: "number" } ],
			minItems: 1,
			maxItems: 3,
			additionalItems: { type: "boolean" },
		} );

		expect( validateJsonSchema( schema ).ok ).toEqual( true );
		expect( validate( validator, true ).ok ).toEqual( false );
		expect( validate( validator, "foo" ).ok ).toEqual( false );
		expect( validate( validator, 3.14 ).ok ).toEqual( false );
		expect( validate( validator, { } ).ok ).toEqual( false );
		expect( validate( validator, [ ] ).ok ).toEqual( false );
		expect( validate( validator, [ "foo" ] ).ok ).toEqual( true );
		expect( validate( validator, [ "foo", 42 ] ).ok ).toEqual( true );
		expect( validate( validator, [ "foo", true ] ).ok ).toEqual( false );
		expect( validate( validator, [ "foo", 42, true ] ).ok )
			.toEqual( true );
		expect( validate( validator, [ "foo", 42, true, false ] ).ok )
			.toEqual( false );
	} );


	it( "Valid schema with maxItems (raw)", ( ) =>
	{
		const validator = new TupleValidator( [
			new RawValidator( { type: "string" } ),
			new NumberValidator( ).optional( ),
		] )
		.additional( new BooleanValidator( ) )
		.maxItems( 3 );

		const { schema } = extractSingleJsonSchema( validator );
		expect( schema ).toEqual( {
			type: "array",
			items: [ { type: "string" }, { type: "number" } ],
			minItems: 1,
			maxItems: 3,
			additionalItems: { type: "boolean" },
		} );

		expect( validateJsonSchema( schema ).ok ).toEqual( true );
		expect( validate( validator, true ).ok ).toEqual( false );
		expect( validate( validator, "foo" ).ok ).toEqual( false );
		expect( validate( validator, 3.14 ).ok ).toEqual( false );
		expect( validate( validator, { } ).ok ).toEqual( false );
		expect( validate( validator, [ ] ).ok ).toEqual( false );
		expect( validate( validator, [ "foo" ] ).ok ).toEqual( true );
		expect( validate( validator, [ "foo", 42 ] ).ok ).toEqual( true );
		expect( validate( validator, [ "foo", true ] ).ok ).toEqual( false );
		expect( validate( validator, [ "foo", 42, true ] ).ok )
			.toEqual( true );
		expect( validate( validator, [ "foo", 42, true, false ] ).ok )
			.toEqual( false );
	} );
} );
