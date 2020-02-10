import { objectOf } from "./utils"

describe( "utils/objectOf", ( ) =>
{
	it( "undefined value", ( ) =>
	{
		expect( objectOf( undefined, "foo" ) ).toEqual( { } );
	} );

	it( "defined value", ( ) =>
	{
		expect( objectOf( 4, "foo" ) ).toEqual( { foo: 4 } );
	} );
} );
