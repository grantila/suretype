import { AnyValidator } from "./validator"
import { validatorType } from "../../validation"
import { validateJsonSchema, validate } from "../../json-schema"
import { extractSingleJsonSchema } from "../../extract-json-schema"


describe( "AnyValidator", ( ) =>
{
	it( "Correct type", ( ) =>
	{
		expect( validatorType( new AnyValidator( ) ) ).toEqual( "any" );
	} );

	it( "Valid basic schema", ( ) =>
	{
		const validator = new AnyValidator( );
		const { schema } = extractSingleJsonSchema( validator );
		expect( schema ).toEqual( { } );

		expect( validateJsonSchema( schema ).ok ).toEqual( true );
		expect( validate( validator, false ).ok ).toEqual( true );
		expect( validate( validator, "foo" ).ok ).toEqual( true );
		expect( validate( validator, 3.14 ).ok ).toEqual( true );
	} );
} );
