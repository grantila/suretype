import { AllOfValidator } from "./validator"
import { validatorType } from "../../validation"
import { validateJsonSchema, validate } from "../../json-schema"
import { NumberValidator } from "../number/validator"
import { extractSingleJsonSchema } from "../../extract-json-schema"


describe( "AllOfValidator", ( ) =>
{
	const a = new NumberValidator( ).integer( );
	const b = new NumberValidator( ).enum( 2, 3.14, 4 );

	it( "Correct type", ( ) =>
	{
		expect( validatorType( new AllOfValidator( [ a, b ] ) ) )
			.toEqual( "all-of" );
	} );

	it( "Valid schema without items", ( ) =>
	{
		expect( ( ) => new AllOfValidator( [ ] ) ).toThrow( "at least" );
	} );

	it( "Valid schema with 1 item", ( ) =>
	{
		const validator = new AllOfValidator( [ a ] );
		const { schema } = extractSingleJsonSchema( validator );

		expect( schema ).toEqual( {
			allOf: [ extractSingleJsonSchema( a ).schema ]
		} );

		expect( validateJsonSchema( schema ).ok ).toEqual( true );
		expect( validate( validator, false ).ok ).toEqual( false );
		expect( validate( validator, "foo" ).ok ).toEqual( false );
		expect( validate( validator, 42 ).ok ).toEqual( true );
	} );

	it( "Valid schema with 2 items", ( ) =>
	{
		const validator = new AllOfValidator( [ a, b ] );
		const { schema } = extractSingleJsonSchema( validator );

		expect( schema ).toEqual( {
			allOf: [
				extractSingleJsonSchema( a ).schema,
				extractSingleJsonSchema( b ).schema
			]
		} );

		expect( validateJsonSchema( schema ).ok ).toEqual( true );
		expect( validate( validator, false ).ok ).toEqual( false );
		expect( validate( validator, "foo" ).ok ).toEqual( false );
		expect( validate( validator, 1 ).ok ).toEqual( false );
		expect( validate( validator, 2 ).ok ).toEqual( true );
		expect( validate( validator, 3.14 ).ok ).toEqual( false );
		expect( validate( validator, 4 ).ok ).toEqual( true );
	} );
} );
