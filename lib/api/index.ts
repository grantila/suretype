import { CoreValidator } from "../validators/core/validator.js"
import { BaseValidator } from "../validators/base/validator.js"
import { BooleanValidator } from "../validators/boolean/validator.js"
import { NumberValidator } from "../validators/number/validator.js"
import { StringValidator } from "../validators/string/validator.js"
import { NullValidator } from "../validators/null/validator.js"
import { AnyValidator } from "../validators/any/validator.js"
import { ObjectValidator } from "../validators/object/validator.js"
import { ArrayValidator } from "../validators/array/validator.js"
import { TupleValidator } from "../validators/tuple/validator.js"
import { AnyOfValidator } from "../validators/or/validator.js"
import { AllOfValidator } from "../validators/all-of/validator.js"
import { IfValidator } from "../validators/if/validator.js"
import { RawValidator } from "../validators/raw/validator.js"
import { RecursiveValidator } from "../validators/recursive/validator.js"
import { TypeOf } from "../validators/functional.js"
import { cloneValidator } from "../validation.js"
import { ArrayFunction, TupleFunction } from "../validators/array-types.js"
import { ExtractObject } from "../validators/object-types.js"
import {
	AnnotationsHolder,
	Annotations,
	TopLevelAnnotations,
	annotateValidator,
	getAnnotations,
} from "../annotations.js"
import { RecursiveValue } from "../validators/types.js"


export {
	CoreValidator,
	BaseValidator,
	BooleanValidator,
	NumberValidator,
	StringValidator,
	NullValidator,
	AnyValidator,
	ObjectValidator,
	ArrayValidator,
	TupleValidator,
	AnyOfValidator,
	AllOfValidator,
	IfValidator,
	RawValidator,
	RecursiveValidator,
}


const string = ( ) => new StringValidator( );

const number = ( ) => new NumberValidator( );

const object =
	< T extends { [ key: string ]: CoreValidator< unknown >; } >( obj: T ) =>
		new ObjectValidator< ExtractObject< T > >( obj );

const tuple: TupleFunction =
	< U extends CoreValidator< unknown >[ ] >( types: U ) =>
		new TupleValidator< any, any, any, any >( types );

const array: ArrayFunction =
	< U extends CoreValidator< unknown > >( itemType?: U ) =>
		new ArrayValidator< Array< TypeOf< U > > >( itemType ?? any( ) );

const arrayOrTuple = (
	< T >( itemType?: T ) =>
		typeof itemType === 'object' && itemType && Array.isArray( itemType )
		? tuple( itemType as any )
		: array( itemType as any )
	) as ArrayFunction & TupleFunction;

const boolean = ( ) => new BooleanValidator( );

const _null = ( ) => new NullValidator( );

const anyOf =
	< T extends CoreValidator< unknown > >( validators: ReadonlyArray< T > ) =>
	new AnyOfValidator< TypeOf< T > >( validators );

const allOf =
	< T extends CoreValidator< unknown > >( validators: ReadonlyArray< T > ) =>
	new AllOfValidator< TypeOf< T > >( validators );

const any = ( ) => new AnyValidator( );

const unknown = ( ) => new AnyValidator< unknown >( );

const _if = < T extends CoreValidator< unknown > >( validator: T ) =>
	new IfValidator< TypeOf< T > >( validator );

const recursive = ( ) => new RecursiveValidator( );

export const v = {
	string,
	number,
	object,
	array: arrayOrTuple,
	boolean,
	null: _null,
	anyOf,
	allOf,
	if: _if,
	any,
	unknown,
	recursive,
};

/**
 * Cast a recursive value (a value in a recursive type)
 */
export const recursiveCast = < T >( value: RecursiveValue ): T => value as any;

/**
 * Cast a value into a recursive value (inversion of recursiveCast)
 */
export const recursiveUnCast = < T >( value: T ) => value as RecursiveValue;

export const raw = < T = unknown >( jsonSchema: any, fragment?: string ) =>
	new RawValidator( jsonSchema, fragment ) as CoreValidator< T >;

export function retype< T extends CoreValidator< unknown > >( validator: T )
{
	return {
		as< U >( ): TypeOf< T > extends U ? CoreValidator< U > : never
		{
			return validator as CoreValidator< U > as any;
		}
	};
}

/**
 * Annotate a validator with a name and other decorations
 *
 * @param annotations Annotations
 * @param validator Target validator to annotate
 * @returns Annotated validator
 */
export function suretype< T extends CoreValidator< unknown > >(
	annotations: TopLevelAnnotations,
	validator: T
)
: T
{
	return annotateValidator(
		cloneValidator( validator, false ),
		new AnnotationsHolder( annotations )
	);
}

export function annotate< T extends CoreValidator< unknown > >(
	annotations: Partial< Annotations >,
	validator: T
)
: T
{
	return annotateValidator(
		cloneValidator( validator, false ),
		new AnnotationsHolder( annotations )
	);
}

/**
 * Ensures a validator is annotated with a name. This will not overwrite the
 * name of a validator, only ensure it has one.
 *
 * @param name The name to annotate with, unless already annotated
 * @param validator The target validator
 * @returns Annotated validator
 */
export function ensureNamed< T extends CoreValidator< unknown > >(
	name: string,
	validator: T
)
: T
{
	const annotations = getAnnotations( validator );
	if ( annotations?.name )
		return validator;

	return annotateValidator(
		cloneValidator( validator, false ),
		new AnnotationsHolder( { ...annotations, name } )
	);
}
