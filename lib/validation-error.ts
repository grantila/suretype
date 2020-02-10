import type * as Ajv from "ajv"
import { prettify } from "awesome-ajv-errors"


export interface ValidationErrorData
{
	errors: Array< Ajv.ErrorObject >;
	explanation?: string;
}
export interface ValidationResultInvalid extends ValidationErrorData
{
	ok: false;
}
export interface ValidationResultValid
{
	ok: true;
	errors?: Array< Ajv.ErrorObject >;
	explanation?: string;
}
export type ValidationResult = ValidationResultInvalid | ValidationResultValid;

export class ValidationError extends Error implements ValidationErrorData
{
	// @ts-ignore
	explanation: string;

	constructor(
		public errors: Array< Ajv.ErrorObject >,
		schema: unknown,
		data: unknown
	)
	{
		super( );

		makeExplanationGetter( this, 'explanation', errors, schema, data );
	}
}

export function makeExplanation(
	errors: Array< Ajv.ErrorObject >,
	schema: unknown,
	data: unknown,
	noFallback = false
)
{
	if ( schema && typeof schema === 'object' )
		return prettify( {
			errors,
			schema,
			data
		} );
	else if ( !noFallback )
		return JSON.stringify( errors, null, 2 );
	else
		return undefined;
}

export function makeExplanationGetter< T extends { }, P extends string >(
	target: T,
	property: P,
	errors: Array< Ajv.ErrorObject >,
	schema: unknown,
	data: unknown,
	noFallback = false
)
: T & { [ p in P ]: string; }
{
	let cache: string | undefined = undefined;
	Object.defineProperty( target, property, {
		get( )
		{
			if ( cache !== undefined )
				return cache;

			cache = makeExplanation( errors, schema, data, noFallback );
			return cache;
		}
	} );

	return target as any;
}
