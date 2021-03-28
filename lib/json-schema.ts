import * as Ajv from "ajv"

import { CoreValidator } from "./validators/core/validator"
import { TypeOf } from "./validators/functional"
import {
	ValidationResult,
	ValidationError,
	makeExplanationGetter,
} from "./validation-error"
import { extractSingleJsonSchema } from "./extract-json-schema"
import { attachSchemaToValidator } from "./validation"
import { isRaw } from "./validators/raw/validator"


function validateWrapper( value: any, validator: Ajv.ValidateFunction )
: ValidationResult
{
	const ok = validator( value );
	if ( ok )
		return { ok: true };

	const ret: ValidationResult = {
		ok: false,
		errors: [ ...validator.errors as Array< Ajv.ErrorObject > ],
	};

	return makeExplanationGetter(
		ret,
		'explanation',
		ret.errors,
		validator.schema,
		value,
		true
	);
}

// Compile JSON Schemas and validate data

export function compileSchema( schema: { }, opts: Ajv.Options = { } )
{
	const ajv = new Ajv( opts );

	const validator = ajv.compile( schema );

	return function validate( value: any )
	{
		return validateWrapper( value, validator );
	}
}

export function validateSchema( schema: { }, value: any )
{
	const validator = compileSchema( schema );
	return validator( value );
}


// Compile suretype validators and validate data

export interface CompileOptionsBase
{
	/**
	 * Ajv options
	 */
	ajvOptions?: Ajv.Options;

	/**
	 * If true, the validator function will not return {ok: boolean} but will
	 * return the payload if it validates, or throw a ValidationError
	 * otherwise.
	 */
	ensure?: boolean;

	/**
	 * If true, the validator function will return true if the data was valid,
	 * and false other.
	 * This value can be used in conditionals to provide deduced types.
	 */
	simple?: boolean;
}
export interface CompileOptionsDefault extends CompileOptionsBase
{
	ensure?: false;
	simple?: false;
}
export interface CompileOptionsEnsure extends CompileOptionsBase
{
	ensure: true;
	simple?: never;
}
export interface CompileOptionsSimple extends CompileOptionsBase
{
	ensure?: never;
	simple: true;
}

export type ValidateFunction = ( value: any ) => ValidationResult;
export type SimpleValidateFunction< T > = ( value: any ) => value is T;
export type EnsureFunction< T > =
	< U = T >( value: any ) => T extends U ? U : never;

export function compile
	< T extends CoreValidator< unknown > = any, U = TypeOf< T > >
(
	schema: T,
	opts: CompileOptionsEnsure
)
: TypeOf< T > extends U ? EnsureFunction< U > : never;
export function compile< T extends CoreValidator< unknown > = any >(
	schema: T,
	opts: CompileOptionsSimple
)
: SimpleValidateFunction< TypeOf< T > >;
export function compile< T extends CoreValidator< unknown > >(
	schema: T,
	opts?: CompileOptionsDefault
)
: ValidateFunction;
export function compile< T extends CoreValidator< unknown > >(
	schema: T,
	opts: CompileOptionsBase = { }
)
:
	| ValidateFunction
	| SimpleValidateFunction< TypeOf< T > >
	| EnsureFunction< TypeOf< T > >
{
	const { ajvOptions = { } } = opts;

	const validator = innerCompile( ajvOptions, schema )

	function validate( value: any )
	{
		const res = validateWrapper( value, validator );

		if ( !opts.ensure && !opts.simple )
			return res;
		else if ( opts.simple )
			return res.ok;
		else if ( res.ok )
			return value;
		else
			throw new ValidationError( res.errors, schema, value );
	}

	return attachSchemaToValidator( validate, schema );
}

export function validate< T extends CoreValidator< unknown > >(
	schema: T,
	value: any
)
{
	const validator = compile( schema );
	return validator( value );
}

export function ensure< R, T extends CoreValidator< unknown > >(
	schema: TypeOf< T > extends R ? T : never,
	value: any
)
: R
{
	const validator = compile( schema, { ensure: true } );
	return validator( value ) as R;
}

function innerCompile(
	options: Ajv.Options,
	validator: CoreValidator< unknown >
)
: Ajv.ValidateFunction
{
	const ajv = new Ajv( options );

	if ( isRaw( validator ) && validator.fragment )
	{
		const { fragment } = validator;
		ajv.addSchema( validator.toSchema( ) );
		const validatorFn = ajv.getSchema( `#/definitions/${fragment}` );
		if ( !validatorFn )
			throw new ReferenceError( `No such fragment "${fragment}"` );
		return validatorFn;
	}
	else
	{
		return ajv.compile( extractSingleJsonSchema( validator ).schema );
	}
}

// Compile and validate JSON Schemas themselves

let _jsonSchemaValidator: ValidateFunction;
export function getJsonSchemaValidator( )
{
	if ( !_jsonSchemaValidator )
	{
		const jsonSchemaSchema =
			require( "ajv/lib/refs/json-schema-draft-07.json" );
		_jsonSchemaValidator = compileSchema( jsonSchemaSchema );
	}
	return _jsonSchemaValidator;
}

export function validateJsonSchema( schema: { } )
{
	const validator = getJsonSchemaValidator( );
	return validator( schema );
}
