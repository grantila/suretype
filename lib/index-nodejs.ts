import "./json-schema-nodejs.js"
import "./ajv-errors-nodejs.js"
export * from "./index-core.js"


// Patch the ValidationError to make Node.js console printing prettier

import { inspect } from "node:util"
import { setErrorHook, ValidationError } from "./validation-error.js"

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
