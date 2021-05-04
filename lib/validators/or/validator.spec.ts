import { AnyOfValidator } from "./validator"
import { validatorType } from "../../validation"
import { validateJsonSchema, validate } from "../../json-schema"
import { NumberValidator } from "../number/validator"
import { extractSingleJsonSchema } from "../../extract-json-schema"
import { RawValidator } from "../raw/validator"


describe( "AnyOfValidator", ( ) =>
{
	it( "Correct type", ( ) =>
	{
		const validator = new AnyOfValidator( [ new NumberValidator( ) ] );
		expect( validatorType( validator ) ).toEqual( "any-of" );
	} );

	it( "Valid basic schema", ( ) =>
	{
		expect( ( ) => new AnyOfValidator( [ ] ) ).toThrow( "at least" );
	} );

	it( "Valid schema with one item", ( ) =>
	{
		const validator = new AnyOfValidator( [ new NumberValidator( ) ] );
		const { schema } = extractSingleJsonSchema( validator );

		expect( schema ).toEqual( { anyOf: [ { type: "number" } ] } );

		expect( validateJsonSchema( schema ).ok ).toEqual( true );
		expect( validate( validator, true ).ok ).toEqual( false );
		expect( validate( validator, "foo" ).ok ).toEqual( false );
		expect( validate( validator, 3.14 ).ok ).toEqual( true );
	} );

	it( "Valid schema with one item", ( ) =>
	{
		const rawValidator = new RawValidator( { type: "string" } );
		const validator = new AnyOfValidator( [
			new NumberValidator( ),
			rawValidator
		] );

		const { schema } = extractSingleJsonSchema( validator );

		expect( schema ).toEqual( {
			anyOf: [ { type: "number" }, { type: "string" } ]
		} );

		expect( validateJsonSchema( schema ).ok ).toEqual( true );
		expect( validate( validator, true ).ok ).toEqual( false );
		expect( validate( validator, "foo" ).ok ).toEqual( true );
		expect( validate( validator, 3.14 ).ok ).toEqual( true );
	} );

	it( "Valid schema with two items", ( ) =>
	{
		const validator = new AnyOfValidator( [
			new NumberValidator( ).lt( 17 ),
			new NumberValidator( ).gt( 42 ),
		] );
		const { schema } = extractSingleJsonSchema( validator );

		expect( schema ).toEqual( { anyOf: [
			{ type: "number", exclusiveMaximum: 17 },
			{ type: "number", exclusiveMinimum: 42 },
		] } );

		expect( validateJsonSchema( schema ).ok ).toEqual( true );
		expect( validate( validator, true ).ok ).toEqual( false );
		expect( validate( validator, "foo" ).ok ).toEqual( false );
		expect( validate( validator, 16 ).ok ).toEqual( true );
		expect( validate( validator, 17 ).ok ).toEqual( false );
		expect( validate( validator, 18 ).ok ).toEqual( false );
		expect( validate( validator, 41 ).ok ).toEqual( false );
		expect( validate( validator, 42 ).ok ).toEqual( false );
		expect( validate( validator, 43 ).ok ).toEqual( true );
	} );
} );
