import type * as Ajv from "ajv"

import { getPrettify } from "./ajv-errors.js"
import { SuretypeOptions, getSuretypeOptions } from "./options.js"


export type ErrorHook = ( err: ValidationError ) => void;

let errorHook: ErrorHook | undefined = undefined;

export function setErrorHook( fn?: ErrorHook | undefined )
{
	errorHook = fn;
}

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

export interface ExplanationOptions extends SuretypeOptions
{
	schema: unknown;
	data: unknown;
	noFallback?: boolean;
}

export class ValidationError extends Error implements ValidationErrorData
{
	// @ts-ignore
	explanation: string;

	constructor(
		public errors: Array< Ajv.ErrorObject >,
		options: ExplanationOptions
	)
	{
		super( 'Validation failed' );

		makeExplanationGetter( this, 'explanation', errors, options );

		errorHook?.( this );
	}
}

function makeExplanation(
	errors: Array< Ajv.ErrorObject >,
	{
		schema,
		data,
		colors = getSuretypeOptions( ).colors,
		location = getSuretypeOptions( ).location,
		bigNumbers = getSuretypeOptions( ).bigNumbers,
		noFallback = false
	}: ExplanationOptions
)
{
	if ( schema && typeof schema === 'object' )
	{
		try
		{
			return getPrettify( )( {
				errors,
				schema,
				data,
				colors,
				location,
				bigNumbers,
			} );
		}
		catch ( err: any )
		{
			console.error( err?.stack );
			return err.message ?? 'Unknown error';
		}
	}
	else if ( !noFallback )
		return JSON.stringify( errors, null, 2 );
	else
		return undefined;
}

export function makeExplanationGetter< T extends { }, P extends string >(
	target: T,
	property: P,
	errors: Array< Ajv.ErrorObject >,
	options: ExplanationOptions
)
: T & { [ p in P ]: string; }
{
	let cache: string | undefined = undefined;
	Object.defineProperty( target, property, {
		get( )
		{
			if ( cache !== undefined )
				return cache;

			cache = makeExplanation( errors, options );
			return cache;
		}
	} );

	return target as any;
}
