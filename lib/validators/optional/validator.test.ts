import { OptionalValidator } from "./validator.js"
import { validatorType } from "../../validation.js"
import { validateJsonSchema, validate } from "../../json-schema.js"
import { NumberValidator } from "../number/validator.js"
import { extractSingleJsonSchema } from "../../extract-json-schema.js"


describe( "OptionalValidator", ( ) =>
{
	it( "Correct type", ( ) =>
	{
		const validator = new OptionalValidator( new NumberValidator( ) );
		expect( validatorType( validator ) ).toEqual( "number" );
	} );

	it( "Correct type on type change", ( ) =>
	{
		const numberValidator = new NumberValidator( );
		const validator = new OptionalValidator( numberValidator );
		expect( validatorType( validator ) ).toEqual( "number" );
		const integerValidator =
			new OptionalValidator( numberValidator.integer( ) );
		expect( validatorType( validator ) ).toEqual( "number" );
		expect( validatorType( integerValidator ) ).toEqual( "integer" );
	} );

	it( "Valid basic schema", ( ) =>
	{
		const validator = new OptionalValidator(
			new NumberValidator( ).enum( 2, 3 ).optional( )
		);
		const { schema } = extractSingleJsonSchema( validator );

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
