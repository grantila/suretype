import { BooleanValidator } from "./validator"
import { validatorType } from "../../validation"
import { validateJsonSchema, validate } from "../../json-schema"
import { extractSingleJsonSchema } from "../../extract-json-schema"


describe( "BooleanValidator", ( ) =>
{
	it( "Correct type", ( ) =>
	{
		expect( validatorType( new BooleanValidator( ) ) )
			.toEqual( "boolean" );
	} );

	it( "Valid basic schema", ( ) =>
	{
		const validator = new BooleanValidator( );
		const { schema } = extractSingleJsonSchema( validator );
		expect( schema ).toEqual( { type: "boolean" } );

		expect( validateJsonSchema( schema ).ok ).toEqual( true );
		expect( validate( validator, false ).ok ).toEqual( true );
		expect( validate( validator, true ).ok ).toEqual( true );
	} );

	it( "Valid schema with enum values (empty)", ( ) =>
	{
		const validator = new BooleanValidator( ).enum( );
		const { schema } = extractSingleJsonSchema( validator );
		expect( schema ).toEqual( { type: "boolean" } );

		expect( validateJsonSchema( schema ).ok ).toEqual( true );
		expect( validate( validator, false ).ok ).toEqual( true );
		expect( validate( validator, true ).ok ).toEqual( true );
	} );

	it( "Valid schema with enum values (false)", ( ) =>
	{
		const validator = new BooleanValidator( ).enum( false );
		const { schema } = extractSingleJsonSchema( validator );

		expect( schema ).toEqual( {
			type: "boolean",
			enum: [ false ],
		} );

		expect( validateJsonSchema( schema ).ok ).toEqual( true );
		expect( validate( validator, false ).ok ).toEqual( true );
		expect( validate( validator, true ).ok ).toEqual( false );
	} );

	it( "Valid schema with enum values (true)", ( ) =>
	{
		const validator = new BooleanValidator( ).enum( true );
		const { schema } = extractSingleJsonSchema( validator );

		expect( schema ).toEqual( {
			type: "boolean",
			enum: [ true ],
		} );

		expect( validateJsonSchema( schema ).ok ).toEqual( true );
		expect( validate( validator, false ).ok ).toEqual( false );
		expect( validate( validator, true ).ok ).toEqual( true );
	} );

	it( "Valid schema with enum values (false, true)", ( ) =>
	{
		const validator = new BooleanValidator( ).enum( false, true );
		const { schema } = extractSingleJsonSchema( validator );

		expect( schema ).toEqual( {
			type: "boolean",
			enum: [ false, true ],
		} );

		expect( validateJsonSchema( schema ).ok ).toEqual( true );
		expect( validate( validator, false ).ok ).toEqual( true );
		expect( validate( validator, true ).ok ).toEqual( true );
	} );
} );
