import { StringValidator } from "./validator.js"
import { validatorType } from "../../validation.js"
import { validateJsonSchema, validate } from "../../json-schema.js"
import { DuplicateConstraintError } from "../../errors.js"
import { extractSingleJsonSchema } from "../../extract-json-schema.js"


describe( "StringValidator", ( ) =>
{
	it( "Correct type", ( ) =>
	{
		expect( validatorType( new StringValidator( ) ) )
			.toEqual( "string" );
	} );

	it( "Valid basic schema", ( ) =>
	{
		const validator = new StringValidator( );
		const { schema } = extractSingleJsonSchema( validator );
		expect( schema ).toEqual( { type: "string" } );

		expect( validateJsonSchema( schema ).ok ).toEqual( true );
		expect( validate( validator, true ).ok ).toEqual( false );
		expect( validate( validator, [ ] ).ok ).toEqual( false );
		expect( validate( validator, 3.14 ).ok ).toEqual( false );
		expect( validate( validator, { } ).ok ).toEqual( false );
		expect( validate( validator, null ).ok ).toEqual( false );
		expect( validate( validator, "3.14" ).ok ).toEqual( true );
		expect( validate( validator, "foo" ).ok ).toEqual( true );
	} );

	it( "Valid schema with enum values (empty)", ( ) =>
	{
		const validator = new StringValidator( ).enum( );
		const { schema } = extractSingleJsonSchema( validator );

		expect( schema ).toEqual( { type: "string" } );

		expect( validateJsonSchema( schema ).ok ).toEqual( true );
		expect( validate( validator, true ).ok ).toEqual( false );
		expect( validate( validator, [ ] ).ok ).toEqual( false );
		expect( validate( validator, 3.14 ).ok ).toEqual( false );
		expect( validate( validator, { } ).ok ).toEqual( false );
		expect( validate( validator, null ).ok ).toEqual( false );
		expect( validate( validator, "3.14" ).ok ).toEqual( true );
		expect( validate( validator, "foo" ).ok ).toEqual( true );
	} );

	it( "Valid schema with enum values (foo)", ( ) =>
	{
		const validator = new StringValidator( ).enum( "foo" );
		const { schema } = extractSingleJsonSchema( validator );

		expect( schema ).toEqual( { type: "string", enum: [ "foo" ] } );

		expect( validateJsonSchema( schema ).ok ).toEqual( true );
		expect( validate( validator, true ).ok ).toEqual( false );
		expect( validate( validator, 3.14 ).ok ).toEqual( false );
		expect( validate( validator, "bar" ).ok ).toEqual( false );
		expect( validate( validator, "foo" ).ok ).toEqual( true );
	} );

	it( "Valid schema with enum values (foo, foo)", ( ) =>
	{
		const validator = new StringValidator( ).enum( "foo", "foo" );
		const { schema } = extractSingleJsonSchema( validator );

		expect( schema ).toEqual( { type: "string", enum: [ "foo" ] } );

		expect( validateJsonSchema( schema ).ok ).toEqual( true );
		expect( validate( validator, true ).ok ).toEqual( false );
		expect( validate( validator, 3.14 ).ok ).toEqual( false );
		expect( validate( validator, "bar" ).ok ).toEqual( false );
		expect( validate( validator, "foo" ).ok ).toEqual( true );
	} );

	it( "Valid schema with enum values (foo, bar)", ( ) =>
	{
		const validator = new StringValidator( ).enum( "foo", "bar" );
		const { schema } = extractSingleJsonSchema( validator );

		expect( schema ).toEqual( { type: "string", enum: [ "foo", "bar" ] } );

		expect( validateJsonSchema( schema ).ok ).toEqual( true );
		expect( validate( validator, true ).ok ).toEqual( false );
		expect( validate( validator, 3.14 ).ok ).toEqual( false );
		expect( validate( validator, "bak" ).ok ).toEqual( false );
		expect( validate( validator, "foo" ).ok ).toEqual( true );
		expect( validate( validator, "bar" ).ok ).toEqual( true );
	} );

	it( "Valid schema with const value", ( ) =>
	{
		const validator = new StringValidator( ).const( "foo" );
		const { schema } = extractSingleJsonSchema( validator );

		expect( schema ).toEqual( { type: "string", const: "foo" } );

		expect( validateJsonSchema( schema ).ok ).toEqual( true );
		expect( validate( validator, true ).ok ).toEqual( false );
		expect( validate( validator, 3.14 ).ok ).toEqual( false );
		expect( validate( validator, "bak" ).ok ).toEqual( false );
		expect( validate( validator, "foo" ).ok ).toEqual( true );
		expect( validate( validator, "bar" ).ok ).toEqual( false );
	} );

	it( "throw on multiple minLength", ( ) =>
	{
		expect( ( ) => new StringValidator( ) .minLength( 2 ).minLength( 4 ) )
			.toThrow( DuplicateConstraintError );
	} );

	it( "throw on multiple maxLength", ( ) =>
	{
		expect( ( ) => new StringValidator( ) .maxLength( 2 ).maxLength( 4 ) )
			.toThrow( DuplicateConstraintError );
	} );

	it( "Valid schema with minLength", ( ) =>
	{
		const validator = new StringValidator( ).minLength( 2 );
		const { schema } = extractSingleJsonSchema( validator );

		expect( schema ).toEqual( { type: "string", minLength: 2 } );

		expect( validateJsonSchema( schema ).ok ).toEqual( true );
		expect( validate( validator, true ).ok ).toEqual( false );
		expect( validate( validator, "f" ).ok ).toEqual( false );
		expect( validate( validator, "fo" ).ok ).toEqual( true );
		expect( validate( validator, "foo" ).ok ).toEqual( true );
	} );

	it( "Valid schema with maxLength", ( ) =>
	{
		const validator = new StringValidator( ).maxLength( 2 );
		const { schema } = extractSingleJsonSchema( validator );

		expect( schema ).toEqual( { type: "string", maxLength: 2 } );

		expect( validateJsonSchema( schema ).ok ).toEqual( true );
		expect( validate( validator, true ).ok ).toEqual( false );
		expect( validate( validator, "f" ).ok ).toEqual( true );
		expect( validate( validator, "fo" ).ok ).toEqual( true );
		expect( validate( validator, "foo" ).ok ).toEqual( false );
	} );

	it( "Valid schema with numeric", ( ) =>
	{
		const validator = new StringValidator( ).numeric( );
		const { schema } = extractSingleJsonSchema( validator );

		expect( schema ).toEqual( {
			type: "string",
			pattern: expect.stringContaining( "0-9" ),
		} );

		expect( validateJsonSchema( schema ).ok ).toEqual( true );
		expect( validate( validator, "foo" ).ok ).toEqual( false );
		expect( validate( validator, "foo123" ).ok ).toEqual( false );
		expect( validate( validator, "123foo" ).ok ).toEqual( false );
		expect( validate( validator, "123" ).ok ).toEqual( true );
		expect( validate( validator, "123.456" ).ok ).toEqual( true );
		expect( validate( validator, "-123" ).ok ).toEqual( true );
		expect( validate( validator, "-123.456" ).ok ).toEqual( true );
	} );

	it( "Valid schema with matches", ( ) =>
	{
		const validator = new StringValidator( ).matches( /^foo/ );
		const { schema } = extractSingleJsonSchema( validator );

		expect( schema ).toEqual( {
			type: "string",
			pattern: expect.stringContaining( "foo" ),
		} );

		expect( validateJsonSchema( schema ).ok ).toEqual( true );
		expect( validate( validator, "foo" ).ok ).toEqual( true );
		expect( validate( validator, "foo123" ).ok ).toEqual( true );
		expect( validate( validator, "123foo" ).ok ).toEqual( false );
	} );

	it( "Fails on multiple matches", ( ) =>
	{
		const test = ( ) =>
			new StringValidator( ).matches( /^foo/ ).matches( /123/ );

		expect( test ).toThrow( );
	} );

	it( "Valid schema with format", ( ) =>
	{
		const validator = new StringValidator( ).format( "date-time" );
		const { schema } = extractSingleJsonSchema( validator );

		expect( schema ).toEqual( { type: "string", format: "date-time" } );

		expect( validateJsonSchema( schema ).ok ).toEqual( true );
		expect( validate( validator, "foo" ).ok ).toEqual( false );
		expect( validate( validator, "foo123" ).ok ).toEqual( false );
		expect( validate( validator, "123foo" ).ok ).toEqual( false );
		expect( validate( validator, "2020-01-01T12:34:56Z" ).ok )
			.toEqual( true );
		expect( validate( validator, "2020-01-99T12:34:56Z" ).ok )
			.toEqual( false );
	} );

	it( "Fails on multiple format", ( ) =>
	{
		const test = ( ) =>
			new StringValidator( ).format( "date-time" ).format( "ipv6" );

		expect( test ).toThrow( );
	} );
} );
