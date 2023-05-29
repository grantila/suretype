import { Type } from "../types.js"
import { ValueValidator } from "./validator.js"
import { TreeTraverser } from "../core/validator.js"
import { validatorType } from "../../validation.js"
import { OptionalValidator, isOptional } from "../optional/validator.js"
import { DuplicateConstraintError } from "../../errors.js"
import { StringValidator } from "../string/validator.js"
import { extractSingleJsonSchema } from "../../extract-json-schema.js"


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
		expect( extractSingleJsonSchema( new X( ) ).schema )
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

	it( "optional() not called", ( ) =>
	{
		const x = new X( );
		expect( isOptional( x ) ).toEqual( false );
	} );

	it( "optional() called", ( ) =>
	{
		const x = new X( );
		const y = x.optional( );
		expect( isOptional( x ) ).toEqual( false );
		expect( isOptional( y ) ).toEqual( true );
	} );

	it( "optional() returns OptionalValidator<>", ( ) =>
	{
		const x = new X( );
		const r = x.optional( );
		expect( isOptional( x ) ).toEqual( false );
		expect( isOptional( r ) ).toEqual( true );
		expect( r ).toBeInstanceOf( OptionalValidator );
	} );

	it( "optional() returns OptionalValidator with correct type", ( ) =>
	{
		const r = new X( ).optional( );
		expect( validatorType( r ) ).toEqual( "string" );
	} );

	it( "optional() returns OptionalValidator with correct JSON schema", ( ) =>
	{
		const r = new X( ).optional( );
		expect( extractSingleJsonSchema( r ).schema ).toEqual(
			{ type: "string" }
		);
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
		expect( extractSingleJsonSchema( x ).schema ).toEqual(
			{ type: "string" }
		);
		expect( extractSingleJsonSchema( y ).schema ).toEqual( {
			type: "string",
			anyOf: [ { enum: [ "foo" ] } ],
		} );
	} );

	it( "single static anyOf()", ( ) =>
	{
		const x = new X( );
		const y = x.anyOf( [ new StringValidator( ).enum( "foo" ) ] );
		expect( extractSingleJsonSchema( x ).schema ).toEqual(
			{ type: "string" }
		);
		expect( extractSingleJsonSchema( y ).schema ).toEqual( {
			type: "string",
			anyOf: [ { enum: [ "foo" ] } ],
		} );
	} );

	it( "single predicate allOf()", ( ) =>
	{
		const x = new X( );
		const y = x.allOf( x => [ x.enum( "foo" ) ] );
		expect( extractSingleJsonSchema( x ).schema ).toEqual(
			{ type: "string" }
		);
		expect( extractSingleJsonSchema( y ).schema ).toEqual( {
			type: "string",
			allOf: [ { enum: [ "foo" ] } ],
		} );
	} );

	it( "single static allOf()", ( ) =>
	{
		const x = new X( );
		const y = x.allOf( [ new StringValidator( ).enum( "foo" ) ] );
		expect( extractSingleJsonSchema( x ).schema ).toEqual(
			{ type: "string" }
		);
		expect( extractSingleJsonSchema( y ).schema ).toEqual( {
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
		expect( extractSingleJsonSchema( x ).schema ).toEqual(
			{ type: "string" }
		);
		expect( extractSingleJsonSchema( y ).schema ).toEqual( {
			type: "string",
			anyOf: [ { enum: [ "foo" ] }, { enum: [ "bar" ] } ],
			allOf: [ { enum: [ "baz" ] } ],
		} );
	} );

	it( "default()", ( ) =>
	{
		const x = new X( );
		const y = x.default( "foo" );
		expect( extractSingleJsonSchema( x ).schema ).toEqual(
			{ type: "string" }
		);
		expect( extractSingleJsonSchema( y ).schema ).toEqual( {
			type: "string",
			default: "foo",
		} );
	} );
} );
