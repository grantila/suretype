import { Type } from "../types"
import { ValueValidator, isRequired } from "./validator"
import { TreeTraverser } from "../base/validator"
import { validatorType } from "../../validation"
import { RequiredValidator } from "../required/validator"
import { DuplicateConstraintError } from "../../errors"
import { StringValidator } from "../string/validator"
import { extractSingleJsonSchema } from "../../extract-json-schema"


class X extends ValueValidator< string, X >
{
	protected type: Type = "string";

	protected toSchema( traverser: TreeTraverser )
	{
		return { type: this.type, ...this.getJsonSchemaObject( traverser ) };
	}

	protected clone( clean: boolean = false )
	{
		return this.setupClone( clean, new X( ) );
	}

	public enum( ...values: string[ ] ): X
	{
		return super.enum( ...values ) as any;
	}

	public getEnum( )
	{
		return super.getEnum( );
	}

	public getEnumSchema( )
	{
		return super.getEnumSchema( );
	}
}


describe( "ValueValidator", ( ) =>
{
	it( "Correct type", ( ) =>
	{
		expect( validatorType( new X( ) ) ).toEqual( "string" );
	} );

	it( "Valid basic schema", ( ) =>
	{
		expect( extractSingleJsonSchema( new X( ) ) )
			.toEqual( { type: "string" } );
	} );

	it( "enum(), getEnum(), getEnumSchema() with empty array", ( ) =>
	{
		const x = new X( );
		const y = x.enum( );
		expect( x.getEnum( ) ).toBeUndefined( );
		expect( x.getEnumSchema( ) ).toEqual( { } );
		expect( y.getEnum( ) ).toEqual( [ ] );
		expect( y.getEnumSchema( ) ).toEqual( { } );
	} );

	it( "enum(), getEnum(), getEnumSchema() with single value", ( ) =>
	{
		const x = new X( );
		const y = x.enum(  "foo" );
		expect( x.getEnum( ) ).toBeUndefined( );
		expect( x.getEnumSchema( ) ).toEqual( { } );
		expect( y.getEnum( ) ).toEqual( [ "foo" ] );
		expect( y.getEnumSchema( ) ).toEqual( { enum: [ "foo" ] } );
	} );

	it( "enum(), getEnum(), getEnumSchema() with values and duplicates", ( ) =>
	{
		const x = new X( );
		const y = x.enum(  "foo", "bar", "foo" );
		expect( x.getEnum( ) ).toBeUndefined( );
		expect( x.getEnumSchema( ) ).toEqual( { } );
		expect( y.getEnum( ) ).toEqual( [ "foo", "bar" ] );
		expect( y.getEnumSchema( ) ).toEqual( { enum: [ "foo", "bar" ] } );
	} );

	it( "enum() multiple times", ( ) =>
	{
		expect( ( ) => new X( ).enum( "foo" ).enum( "bar" ) )
			.toThrow( DuplicateConstraintError );
	} );

	it( "required() not called", ( ) =>
	{
		const x = new X( );
		expect( isRequired( x ) ).toEqual( false );
	} );

	it( "required() called", ( ) =>
	{
		const x = new X( );
		const y = x.required( );
		expect( isRequired( x ) ).toEqual( false );
		expect( isRequired( y ) ).toEqual( true );
	} );

	it( "required() returns RequiredValidator<>", ( ) =>
	{
		const x = new X( );
		const r = x.required( );
		expect( isRequired( x ) ).toEqual( false );
		expect( isRequired( r ) ).toEqual( true );
		expect( r ).toBeInstanceOf( RequiredValidator );
	} );

	it( "required() returns RequiredValidator with correct type", ( ) =>
	{
		const r = new X( ).required( );
		expect( validatorType( r ) ).toEqual( "string" );
	} );

	it( "required() returns RequiredValidator with correct JSON schema", ( ) =>
	{
		const r = new X( ).required( );
		expect( extractSingleJsonSchema( r ) ).toEqual( { type: "string" } );
	} );

	it( "empty anyOf()", ( ) =>
	{
		expect( ( ) => new X( ).anyOf( _ => [ ] ) ).toThrow( RangeError );
	} );

	it( "empty allOf()", ( ) =>
	{
		expect( ( ) => new X( ).allOf( _ => [ ] ) ).toThrow( RangeError );
	} );

	it( "single predicate anyOf()", ( ) =>
	{
		const x = new X( );
		const y = x.anyOf( x => [ x.enum( "foo" ) ] );
		expect( extractSingleJsonSchema( x ) ).toEqual( { type: "string" } );
		expect( extractSingleJsonSchema( y ) ).toEqual( {
			type: "string",
			anyOf: [ { enum: [ "foo" ] } ],
		} );
	} );

	it( "single static anyOf()", ( ) =>
	{
		const x = new X( );
		const y = x.anyOf( [ new StringValidator( ).enum( "foo" ) ] );
		expect( extractSingleJsonSchema( x ) ).toEqual( { type: "string" } );
		expect( extractSingleJsonSchema( y ) ).toEqual( {
			type: "string",
			anyOf: [ { enum: [ "foo" ] } ],
		} );
	} );

	it( "single predicate allOf()", ( ) =>
	{
		const x = new X( );
		const y = x.allOf( x => [ x.enum( "foo" ) ] );
		expect( extractSingleJsonSchema( x ) ).toEqual( { type: "string" } );
		expect( extractSingleJsonSchema( y ) ).toEqual( {
			type: "string",
			allOf: [ { enum: [ "foo" ] } ],
		} );
	} );

	it( "single static allOf()", ( ) =>
	{
		const x = new X( );
		const y = x.allOf( [ new StringValidator( ).enum( "foo" ) ] );
		expect( extractSingleJsonSchema( x ) ).toEqual( { type: "string" } );
		expect( extractSingleJsonSchema( y ) ).toEqual( {
			type: "string",
			allOf: [ { enum: [ "foo" ] } ],
		} );
	} );

	it( "anyOf(), allOf()", ( ) =>
	{
		const x = new X( );
		const y = x
			.anyOf( x => [ x.enum( "foo" ), x.enum( "bar" ) ] )
			.allOf( x => [ x.enum( "baz" ) ] );
		expect( extractSingleJsonSchema( x ) ).toEqual( { type: "string" } );
		expect( extractSingleJsonSchema( y ) ).toEqual( {
			type: "string",
			anyOf: [ { enum: [ "foo" ] }, { enum: [ "bar" ] } ],
			allOf: [ { enum: [ "baz" ] } ],
		} );
	} );

	it( "default()", ( ) =>
	{
		const x = new X( );
		const y = x.default( "foo" );
		expect( extractSingleJsonSchema( x ) ).toEqual( { type: "string" } );
		expect( extractSingleJsonSchema( y ) ).toEqual( {
			type: "string",
			default: "foo",
		} );
	} );
} );
