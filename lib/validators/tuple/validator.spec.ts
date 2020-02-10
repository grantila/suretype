import { TupleValidator } from "./validator"
import { validatorType } from "../../validation"
import { validateJsonSchema, validate } from "../../json-schema"
import { AnyValidator } from "../any/validator"
import { NumberValidator } from "../number/validator"
import { StringValidator } from "../string/validator"
import { BooleanValidator } from "../boolean/validator"
import { extractSingleJsonSchema } from "../../extract-json-schema"


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
		const schema = extractSingleJsonSchema( validator );

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
		const schema = extractSingleJsonSchema( validator );

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
		const schema = extractSingleJsonSchema( validator );

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
		const schema = extractSingleJsonSchema( validator );

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

	it( "Valid schema with 1 item, and additional (any)", ( ) =>
	{
		const validator = new TupleValidator( [ new StringValidator( ) ] )
			.additional( true );
		const schema = extractSingleJsonSchema( validator );

		expect( schema ).toEqual( {
			type: "array",
			items: [ { type: "string" } ],
			additionalItems: true,
		} );

		expect( validateJsonSchema( schema ).ok ).toEqual( true );
		expect( validate( validator, true ).ok ).toEqual( false );
		expect( validate( validator, "foo" ).ok ).toEqual( false );
		expect( validate( validator, 3.14 ).ok ).toEqual( false );
		expect( validate( validator, { } ).ok ).toEqual( false );
		expect( validate( validator, [ ] ).ok ).toEqual( true );
		expect( validate( validator, [ "foo" ] ).ok ).toEqual( true );
		expect( validate( validator, [ "foo", 42 ] ).ok ).toEqual( true );
		expect( validate( validator, [ 42 ] ).ok ).toEqual( false );
	} );

	it( "Valid schema with 1 required item, and no additional", ( ) =>
	{
		const validator = new TupleValidator( [
			new StringValidator( ).required( )
		] );
		const schema = extractSingleJsonSchema( validator );

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

	it( "Valid schema with 1 item, and additional (typed)", ( ) =>
	{
		const validator = new TupleValidator( [
			new StringValidator( ).required( )
		] )
			.additional( new NumberValidator( ) );
		const schema = extractSingleJsonSchema( validator );

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
			new StringValidator( ).required( ),
			new NumberValidator( ).enum( 17, 42 ),
		] )
		.additional( new BooleanValidator( ) );

		const schema = extractSingleJsonSchema( validator );

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
			new StringValidator( ).required( ),
			new NumberValidator( ),
		] )
		.additional( new BooleanValidator( ) )
		.minItems( 3 );

		const schema = extractSingleJsonSchema( validator );
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
			new StringValidator( ).required( ),
			new NumberValidator( ),
		] )
		.additional( new BooleanValidator( ) )
		.maxItems( 3 );

		const schema = extractSingleJsonSchema( validator );
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
