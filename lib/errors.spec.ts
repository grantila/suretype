import { DuplicateError, DuplicateConstraintError } from './errors'

describe( 'errors', ( ) =>
{
	describe( 'DuplicateError', ( ) =>
	{
		it( 'should have proper name', ( ) =>
		{
			const err = new DuplicateError( "err" );
			expect( err.name ).toBe( "DuplicateError" );
		} );
	} );

	describe( 'DuplicateConstraintError', ( ) =>
	{
		it( 'should have proper name', ( ) =>
		{
			const err = new DuplicateConstraintError( "err" );
			expect( err.name ).toBe( "DuplicateConstraintError" );
		} );
	} );
} );
