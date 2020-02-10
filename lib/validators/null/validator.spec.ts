import { NullValidator } from "./validator"
import { validatorType } from "../../validation"
import { validateJsonSchema, validate } from "../../json-schema"
import { extractSingleJsonSchema } from "../../extract-json-schema"


describe( "NullValidator", ( ) =>
{
	it( "Correct type", ( ) =>
	{
		expect( validatorType( new NullValidator( ) ) ).toEqual( "null" );
	} );

	it( "Valid basic schema", ( ) =>
	{
		const validator = new NullValidator( );
		const schema = extractSingleJsonSchema( validator );

		expect( schema ).toEqual( { type: "null" } );

		expect( validateJsonSchema( schema ).ok ).toEqual( true );
		expect( validate( validator, false ).ok ).toEqual( false );
		expect( validate( validator, "foo" ).ok ).toEqual( false );
		expect( validate( validator, "null" ).ok ).toEqual( false );
		expect( validate( validator, null ).ok ).toEqual( true );
	} );

	it( "Valid schema with enum values (empty)", ( ) =>
	{
		const validator = new NullValidator( ).enum( );
		const schema = extractSingleJsonSchema( validator );

		expect( schema ).toEqual( { type: "null" } );

		expect( validateJsonSchema( schema ).ok ).toEqual( true );
		expect( validate( validator, false ).ok ).toEqual( false );
		expect( validate( validator, "foo" ).ok ).toEqual( false );
		expect( validate( validator, "null" ).ok ).toEqual( false );
		expect( validate( validator, null ).ok ).toEqual( true );
	} );

	it( "Valid schema with enum values (null)", ( ) =>
	{
		const validator = new NullValidator( ).enum( null );
		const schema = extractSingleJsonSchema( validator );

		expect( schema ).toEqual( { type: "null", enum: [ null ] } );

		expect( validateJsonSchema( schema ).ok ).toEqual( true );
		expect( validate( validator, false ).ok ).toEqual( false );
		expect( validate( validator, "foo" ).ok ).toEqual( false );
		expect( validate( validator, "null" ).ok ).toEqual( false );
		expect( validate( validator, null ).ok ).toEqual( true );
	} );
} );
