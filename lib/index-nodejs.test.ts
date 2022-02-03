import { inspect } from "node:util"

import { v, compile, validate, isValid, ensure } from "./index-nodejs.js"
import { ValidationError } from "./validation-error.js"


const getError = ( fn: ( ) => any ): Error =>
	{
		try
		{
			fn( );
		}
		catch ( err: any )
		{
			return err;
		}
		throw new EvalError( 'Function should have thrown' );
	};

describe( "nodejs", ( ) =>
{
	it( "should inject decorated console output for ValidationError", ( ) =>
	{
		expect( ( ValidationError.prototype as any )[ inspect.custom ] )
			.toStrictEqual( expect.any( Function ) );
	} );

	it( "should get decorated ValidationError", ( ) =>
	{
		const schema = v.object( { foo: v.number( ) } );
		const validator = compile( schema, { ensure: true } );
		const error = getError( ( ) => validator( { foo: "42" } ) );

		expect( inspect( error ) ).toMatchSnapshot( );
	} );
} );

describe( "short-hands", ( ) =>
{
	const schema = v.object( {
		firstName: v.string( ).required( ),
		lastName: v.string( ).required( ),
	} );

	const valueValid = { firstName: 'Foo', lastName: 'Bar' } as unknown;
	const valueInvalid = { firstName: 'Foo', lastName: 42 } as unknown;

	it ( "validate", ( ) =>
	{
		const validationValid = validate( schema, valueValid );
		const validationInvalid = validate( schema, valueInvalid );

		expect( validationValid.ok ).toBe( true );
		expect( validationInvalid.ok ).toBe( false );
		expect( validationInvalid.errors?.length ).toBe( 1 );
		expect( validationInvalid.explanation ).toContain( "lastName" );
	} );

	it ( "isValid", ( ) =>
	{
		const True = isValid( schema, valueValid );
		const False = isValid( schema, valueInvalid );

		if ( True )
		{
			// This compiles because of type-guarded return
			expect( valueValid.firstName ).toBe( 'Foo' );
		}

		expect( True ).toBe( true );
		expect( False ).toBe( false );
	} );

	it ( "ensure", ( ) =>
	{
		const user = ensure( schema, valueValid );

		// This compiles because of type-guard
		expect( user.firstName ).toBe( 'Foo' );

		expect( ( ) => ensure( schema, valueInvalid ) )
			.toThrowErrorMatchingSnapshot( );
	} );
} );
