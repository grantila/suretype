import Ajv from "ajv"

import { CoreValidator } from "./validators/core/validator.js"
import { TypeOf } from "./validators/functional.js"
import {
	ValidationResult,
	ValidationError,
	makeExplanationGetter,
} from "./validation-error.js"
import { extractSingleJsonSchema } from "./extract-json-schema.js"
import { attachSchemaToValidator } from "./validation.js"
import { getRaw } from "./validators/raw/validator.js"


function validateWrapper(
	value: any,
	validator: Ajv.ValidateFunction,
	opts: CompileOptionsCore
)
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
		{
			schema: validator.schema,
			data: value,
			colors: opts?.colors,
			noFallback: true,
		}
	);
}

// Compile JSON Schemas and validate data

export function compileSchema( schema: { }, opts: CompileOptionsCore = { } )
{
	const { ajvOptions = { } } = opts;

	const ajv = new Ajv( ajvOptions );

	const validator = ajv.compile( schema );

	return function validate( value: any )
	{
		return validateWrapper( value, validator, opts );
	}
}

export function validateSchema( schema: { }, value: any )
{
	const validator = compileSchema( schema );
	return validator( value );
}


// Compile suretype validators and validate data

export interface CompileOptionsCore
{
	/**
	 * Ajv options
	 */
	ajvOptions?: Ajv.Options;

	/**
	 * Use colors or disable colors for this validator (will fallback to the
	 * default set using `setSuretypeOptions`)
	 */
	colors?: boolean;
}

export interface CompileOptionsBase extends CompileOptionsCore
{
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
	const { ajvOptions = { }, colors } = opts;

	const validator = innerCompile( ajvOptions, schema )

	function validate( value: any )
	{
		const res = validateWrapper( value, validator, opts );

		if ( !opts.ensure && !opts.simple )
			return res;
		else if ( opts.simple )
			return res.ok;
		else if ( res.ok )
			return value;
		else
			throw new ValidationError(
				res.errors,
				{ schema, data:value, colors }
			);
	}

	return attachSchemaToValidator( validate, schema );
}

export function validate< T extends CoreValidator< unknown > >(
	schema: T,
	value: any,
	options?: CompileOptionsCore
)
{
	const validator = compile( schema, options );
	return validator( value );
}

export function isValid< T extends CoreValidator< unknown > >(
	schema: T,
	value: any,
	options?: CompileOptionsCore
)
: value is TypeOf< T, false >
{
	const validator = compile( schema, { ...options, simple: true } );
	return validator( value );
}

export function ensure< T extends CoreValidator< unknown > >(
	schema: T,
	value: any,
	options?: CompileOptionsCore
)
{
	const validator = compile( schema, { ...options, ensure: true } );
	return validator( value );
}

function innerCompile(
	options: Ajv.Options,
	validator: CoreValidator< unknown >
)
: Ajv.ValidateFunction
{
	const ajv = new Ajv( options );

	const raw = getRaw( validator );
	if ( raw && raw.fragment )
	{
		const { fragment } = raw;
		ajv.addSchema( raw.toSchema( ) );
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

let _schemaDraft07: any = undefined;
export function setSchemaDraft07( draft: any )
{
	_schemaDraft07 = draft;
}

let _jsonSchemaValidator: ValidateFunction;
function getJsonSchemaValidator( )
{
	if ( !_jsonSchemaValidator )
		_jsonSchemaValidator = compileSchema( _schemaDraft07 );

	return _jsonSchemaValidator;
}

export function validateJsonSchema( schema: { } )
{
	const validator = getJsonSchemaValidator( );
	return validator( schema );
}
