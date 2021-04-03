export * from './index'


// Patch the ValidationError to make Node.js console printing prettier

import { inspect } from "util"
import { setErrorHook, ValidationError } from './validation-error'

( ValidationError.prototype as any )[ inspect.custom ] = function( )
{
	return ( this as ValidationError ).explanation;
}

const debouncedExplanations = new WeakSet< ValidationError >( );

setErrorHook( ( err ) =>
{
	const { message, stack } = err;
	Object.defineProperties( err, {
		message: {
			get( this: ValidationError )
			{
				if ( debouncedExplanations.has( this ) )
					return message;
				debouncedExplanations.add( this );
				setImmediate( ( ) => debouncedExplanations.delete( this ) );
				return message + "\n" + this.explanation;
			}
		},
		stack: {
			get( this: ValidationError )
			{
				if ( debouncedExplanations.has( this ) )
					return stack;
				debouncedExplanations.add( this );
				setImmediate( ( ) => debouncedExplanations.delete( this ) );
				return this.explanation + "\n" + stack;
			}
		},
	} );
} );
