process.env.FORCE_COLOR = '0';

import { inspect } from "util"
import { v, compile } from './nodejs'
import { ValidationError } from './validation-error'


const getError = ( fn: ( ) => any ): Error =>
	{
		try
		{
			fn( );
		}
		catch ( err )
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
