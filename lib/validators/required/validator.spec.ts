import { RequiredValidator } from "./validator"
import { validatorType } from "../../validation"
import { validateJsonSchema, validate } from "../../json-schema"
import { NumberValidator } from "../number/validator"
import { extractSingleJsonSchema } from "../../extract-json-schema"


describe( "RequiredValidator", ( ) =>
{
	it( "Correct type", ( ) =>
	{
		const validator = new RequiredValidator( new NumberValidator( ) );
		expect( validatorType( validator ) ).toEqual( "number" );
	} );

	it( "Correct type on type change", ( ) =>
	{
		const numberValidator = new NumberValidator( );
		const validator = new RequiredValidator( numberValidator );
		expect( validatorType( validator ) ).toEqual( "number" );
		const integerValidator =
			new RequiredValidator( numberValidator.integer( ) );
		expect( validatorType( validator ) ).toEqual( "number" );
		expect( validatorType( integerValidator ) ).toEqual( "integer" );
	} );

	it( "Valid basic schema", ( ) =>
	{
		const validator = new RequiredValidator(
			new NumberValidator( ).enum( 2, 3 )
		);
		const schema = extractSingleJsonSchema( validator );

		expect( schema ).toEqual( { type: "number", enum: [ 2, 3 ] } );

		expect( validateJsonSchema( schema ).ok ).toEqual( true );
		expect( validate( validator, true ).ok ).toEqual( false );
		expect( validate( validator, "foo" ).ok ).toEqual( false );
		expect( validate( validator, 1 ).ok ).toEqual( false );
		expect( validate( validator, 2 ).ok ).toEqual( true );
		expect( validate( validator, 3 ).ok ).toEqual( true );
		expect( validate( validator, 4 ).ok ).toEqual( false );
	} );
} );
