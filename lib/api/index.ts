import { BaseValidator } from "../validators/base/validator"
import { BooleanValidator } from "../validators/boolean/validator"
import { NumberValidator } from "../validators/number/validator"
import { StringValidator } from "../validators/string/validator"
import { NullValidator } from "../validators/null/validator"
import { AnyValidator } from "../validators/any/validator"
import { ObjectValidator } from "../validators/object/validator"
import { ArrayValidator } from "../validators/array/validator"
import { TupleValidator } from "../validators/tuple/validator"
import { AnyOfValidator } from "../validators/or/validator"
import { AllOfValidator } from "../validators/all-of/validator"
import { IfValidator } from "../validators/if/validator"
import { RawValidator } from "../validators/raw/validator"
import { RecursiveValidator } from "../validators/recursive/validator"
import { TypeOf } from "../validators/functional"
import { cloneValidator } from "../validation"
import { ArrayFunction, TupleFunction } from "../validators/array-types"
import { ExtractObject } from "../validators/object-types"
import {
	AnnotationsHolder,
	Annotations,
	TopLevelAnnotations,
	annotateValidator,
	getAnnotations,
} from "../annotations"
import { RecursiveValue } from "../validators/types"


const string = ( ) => new StringValidator( );

const number = ( ) => new NumberValidator( );

const object =
	< T extends { [ key: string ]: BaseValidator< unknown >; } >( obj: T ) =>
		new ObjectValidator< ExtractObject< T > >( obj );

const tuple: TupleFunction =
	< U extends BaseValidator< unknown >[ ] >( types: U ) =>
		new TupleValidator< any, any, any, any >( types );

const array: ArrayFunction =
	< U extends BaseValidator< unknown > >( itemType?: U ) =>
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
	< T extends BaseValidator< unknown > >( validators: ReadonlyArray< T > ) =>
	new AnyOfValidator< TypeOf< T > >( validators );

const allOf =
	< T extends BaseValidator< unknown > >( validators: ReadonlyArray< T > ) =>
	new AllOfValidator< TypeOf< T > >( validators );

const any = ( ) => new AnyValidator( );

const _if = < T extends BaseValidator< unknown > >( validator: T ) =>
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

export const raw = < T = unknown >( jsonSchema: any ) =>
	new RawValidator( jsonSchema ) as BaseValidator< T >;

/**
 * Annotate a validator with a name and other decorations
 *
 * @param annotations Annotations
 * @param validator Target validator to annotate
 * @returns Annotated validator
 */
export function suretype< T extends BaseValidator< unknown, any > >(
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

export function annotate< T extends BaseValidator< unknown, any > >(
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
export function ensureNamed< T extends BaseValidator< unknown, any > >(
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
