import { NumberValidator } from "./validator"
import { validatorType } from "../../validation"
import { validateJsonSchema, validate } from "../../json-schema"
import { DuplicateError } from "../../errors"
import { extractSingleJsonSchema } from "../../extract-json-schema"


describe( "NumberValidator", ( ) =>
{
	it( "Correct type (number)", ( ) =>
	{
		expect( validatorType( new NumberValidator( ) ) ).toEqual( "number" );
	} );

	it( "Correct type (integer)", ( ) =>
	{
		expect( validatorType( new NumberValidator( ).integer( ) ) )
			.toEqual( "integer" );
	} );

	it( "Valid basic schema", ( ) =>
	{
		const validator = new NumberValidator( );
		const { schema } = extractSingleJsonSchema( validator );
		expect( schema ).toEqual( { type: "number" } );

		expect( validateJsonSchema( schema ).ok ).toEqual( true );
		expect( validate( validator, true ).ok ).toEqual( false );
		expect( validate( validator, [ ] ).ok ).toEqual( false );
		expect( validate( validator, { } ).ok ).toEqual( false );
		expect( validate( validator, null ).ok ).toEqual( false );
		expect( validate( validator, "3.14" ).ok ).toEqual( false );
		expect( validate( validator, "foo" ).ok ).toEqual( false );
		expect( validate( validator, 3.14 ).ok ).toEqual( true );
	} );

	it( "Valid schema with enum values (empty)", ( ) =>
	{
		const validator = new NumberValidator( ).enum( );
		const { schema } = extractSingleJsonSchema( validator );

		expect( schema ).toEqual( { type: "number" } );

		expect( validateJsonSchema( schema ).ok ).toEqual( true );
		expect( validate( validator, true ).ok ).toEqual( false );
		expect( validate( validator, [ ] ).ok ).toEqual( false );
		expect( validate( validator, { } ).ok ).toEqual( false );
		expect( validate( validator, null ).ok ).toEqual( false );
		expect( validate( validator, "3.14" ).ok ).toEqual( false );
		expect( validate( validator, "foo" ).ok ).toEqual( false );
		expect( validate( validator, 3.14 ).ok ).toEqual( true );
	} );

	it( "Valid schema with enum values (42)", ( ) =>
	{
		const validator = new NumberValidator( ).enum( 42 );
		const { schema } = extractSingleJsonSchema( validator );

		expect( schema ).toEqual( { type: "number", enum: [ 42 ] } );

		expect( validateJsonSchema( schema ).ok ).toEqual( true );
		expect( validate( validator, true ).ok ).toEqual( false );
		expect( validate( validator, "bar" ).ok ).toEqual( false );
		expect( validate( validator, "foo" ).ok ).toEqual( false );
		expect( validate( validator, 3.14 ).ok ).toEqual( false );
		expect( validate( validator, 42 ).ok ).toEqual( true );
	} );

	it( "Valid schema with enum values (17, 42)", ( ) =>
	{
		const validator = new NumberValidator( ).enum( 17, 42 );
		const { schema } = extractSingleJsonSchema( validator );

		expect( schema ).toEqual( { type: "number", enum: [ 17, 42 ] } );

		expect( validateJsonSchema( schema ).ok ).toEqual( true );
		expect( validate( validator, true ).ok ).toEqual( false );
		expect( validate( validator, "bak" ).ok ).toEqual( false );
		expect( validate( validator, "foo" ).ok ).toEqual( false );
		expect( validate( validator, "bar" ).ok ).toEqual( false );
		expect( validate( validator, 3.14 ).ok ).toEqual( false );
		expect( validate( validator, 17 ).ok ).toEqual( true );
		expect( validate( validator, 42 ).ok ).toEqual( true );
	} );

	it( "Valid schema with enum values (17, 42) as integers", ( ) =>
	{
		const validator = new NumberValidator( ).integer( ).enum( 17, 42 );
		const { schema } = extractSingleJsonSchema( validator );

		expect( schema ).toEqual( { type: "integer", enum: [ 17, 42 ] } );

		expect( validateJsonSchema( schema ).ok ).toEqual( true );
		expect( validate( validator, true ).ok ).toEqual( false );
		expect( validate( validator, "bak" ).ok ).toEqual( false );
		expect( validate( validator, "foo" ).ok ).toEqual( false );
		expect( validate( validator, "bar" ).ok ).toEqual( false );
		expect( validate( validator, 3.14 ).ok ).toEqual( false );
		expect( validate( validator, 17 ).ok ).toEqual( true );
		expect( validate( validator, 42 ).ok ).toEqual( true );
	} );

	it( "Valid schema with gt", ( ) =>
	{
		const validator = new NumberValidator( ).gt( 3.14 );
		const { schema } = extractSingleJsonSchema( validator );

		expect( schema ).toEqual( { type: "number", exclusiveMinimum: 3.14 } );

		expect( validateJsonSchema( schema ).ok ).toEqual( true );
		expect( validate( validator, true ).ok ).toEqual( false );
		expect( validate( validator, "foo" ).ok ).toEqual( false );
		expect( validate( validator, 3.14 ).ok ).toEqual( false );
		expect( validate( validator, 3.15 ).ok ).toEqual( true );
	} );

	it( "Valid schema with gte", ( ) =>
	{
		const validator = new NumberValidator( ).gte( 3.14 );
		const { schema } = extractSingleJsonSchema( validator );

		expect( schema ).toEqual( { type: "number", minimum: 3.14 } );

		expect( validateJsonSchema( schema ).ok ).toEqual( true );
		expect( validate( validator, true ).ok ).toEqual( false );
		expect( validate( validator, "foo" ).ok ).toEqual( false );
		expect( validate( validator, 3.13 ).ok ).toEqual( false );
		expect( validate( validator, 3.14 ).ok ).toEqual( true );
		expect( validate( validator, 3.15 ).ok ).toEqual( true );
	} );

	it( "Valid schema with lt", ( ) =>
	{
		const validator = new NumberValidator( ).lt( 3.14 );
		const { schema } = extractSingleJsonSchema( validator );

		expect( schema ).toEqual( { type: "number", exclusiveMaximum: 3.14 } );

		expect( validateJsonSchema( schema ).ok ).toEqual( true );
		expect( validate( validator, true ).ok ).toEqual( false );
		expect( validate( validator, "foo" ).ok ).toEqual( false );
		expect( validate( validator, 3.13 ).ok ).toEqual( true );
		expect( validate( validator, 3.14 ).ok ).toEqual( false );
	} );

	it( "Valid schema with lte", ( ) =>
	{
		const validator = new NumberValidator( ).lte( 3.14 );
		const { schema } = extractSingleJsonSchema( validator );

		expect( schema ).toEqual( { type: "number", maximum: 3.14 } );

		expect( validateJsonSchema( schema ).ok ).toEqual( true );
		expect( validate( validator, true ).ok ).toEqual( false );
		expect( validate( validator, "foo" ).ok ).toEqual( false );
		expect( validate( validator, 3.15 ).ok ).toEqual( false );
		expect( validate( validator, 3.14 ).ok ).toEqual( true );
		expect( validate( validator, 3.13 ).ok ).toEqual( true );
	} );

	it( "Valid schema with gt+lt", ( ) =>
	{
		const validator = new NumberValidator( ).gt( 3.14 ).lt( 3.16 );
		const { schema } = extractSingleJsonSchema( validator );

		expect( schema ).toEqual( {
			type: "number",
			exclusiveMinimum: 3.14,
			exclusiveMaximum: 3.16,
		} );

		expect( validateJsonSchema( schema ).ok ).toEqual( true );
		expect( validate( validator, true ).ok ).toEqual( false );
		expect( validate( validator, "foo" ).ok ).toEqual( false );
		expect( validate( validator, 3.14 ).ok ).toEqual( false );
		expect( validate( validator, 3.15 ).ok ).toEqual( true );
		expect( validate( validator, 3.16 ).ok ).toEqual( false );
	} );

	it( "cannot set gt twice", ( ) =>
	{
		expect( ( ) => new NumberValidator( ).gt( 1 ).gt( 1 ) )
			.toThrow( DuplicateError );
	} );

	it( "cannot set gt followed by gte", ( ) =>
	{
		expect( ( ) => new NumberValidator( ).gt( 1 ).gte( 1 ) )
			.toThrow( DuplicateError );
	} );

	it( "cannot set gte followed by gt", ( ) =>
	{
		expect( ( ) => new NumberValidator( ).gte( 1 ).gt( 1 ) )
			.toThrow( DuplicateError );
	} );

	it( "cannot set gte twice", ( ) =>
	{
		expect( ( ) => new NumberValidator( ).gte( 1 ).gte( 1 ) )
			.toThrow( DuplicateError );
	} );

	it( "cannot set lt twice", ( ) =>
	{
		expect( ( ) => new NumberValidator( ).lt( 1 ).lt( 1 ) )
			.toThrow( DuplicateError );
	} );

	it( "cannot set lt followed by lte", ( ) =>
	{
		expect( ( ) => new NumberValidator( ).lt( 1 ).lte( 1 ) )
			.toThrow( DuplicateError );
	} );

	it( "cannot set lte followed by lt", ( ) =>
	{
		expect( ( ) => new NumberValidator( ).lte( 1 ).lt( 1 ) )
			.toThrow( DuplicateError );
	} );

	it( "cannot set lte twice", ( ) =>
	{
		expect( ( ) => new NumberValidator( ).lte( 1 ).lte( 1 ) )
			.toThrow( DuplicateError );
	} );

	it( "Valid schema with multipleOf", ( ) =>
	{
		const validator = new NumberValidator( ).multipleOf( 3 );
		const { schema } = extractSingleJsonSchema( validator );

		expect( schema ).toEqual( {
			type: "number",
			multipleOf: 3,
		} );

		expect( validateJsonSchema( schema ).ok ).toEqual( true );
		expect( validate( validator, 0 ).ok ).toEqual( true );
		expect( validate( validator, 1 ).ok ).toEqual( false );
		expect( validate( validator, 2 ).ok ).toEqual( false );
		expect( validate( validator, 3 ).ok ).toEqual( true );
		expect( validate( validator, 4 ).ok ).toEqual( false );
		expect( validate( validator, 5 ).ok ).toEqual( false );
		expect( validate( validator, 6 ).ok ).toEqual( true );
	} );

	it( "cannot set multipleOf twice", ( ) =>
	{
		expect(
			( ) => new NumberValidator( ).multipleOf( 1 ).multipleOf( 1 )
		).toThrow( );
	} );
} );
