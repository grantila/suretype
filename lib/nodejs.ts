export * from './index'


// Patch the ValidationError to make Node.js console printing prettier

import { inspect } from "util"
import { ValidationError } from './validation-error'

( ValidationError.prototype as any )[ inspect.custom ] = function( )
{
	return ( this as ValidationError ).explanation;
}
