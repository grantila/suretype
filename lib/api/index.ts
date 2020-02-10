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
import { TypeOf } from "../validators/functional"
import { cloneValidator, decorateValidator } from "../validation"
import { ArrayFunction, TupleFunction } from "../validators/array-types"
import { ExtractObject } from "../validators/object-types"
import { DecorationsHolder, Decorations } from "../validators/decorations"


const string = ( ) => new StringValidator( );

const number = ( ) => new NumberValidator( );

const object =
	< T extends { [ key: string ]: BaseValidator< unknown >; } >( obj: T ) =>
		new ObjectValidator< ExtractObject< T > >( obj );

const tuple: TupleFunction =
	< U extends BaseValidator< unknown >[ ] >( types: U ) =>
		new TupleValidator< any, any, any, any >( types );

const array: ArrayFunction =
	< T extends unknown, U extends BaseValidator< T > >( itemType?: U ) =>
		new ArrayValidator< Array< T > >( itemType ?? any( ) );

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
};

export function suretype< T extends BaseValidator< unknown, any > >(
	decorations: Decorations,
	validator: T
)
: T
{
	return decorateValidator(
		cloneValidator( validator, false ),
		new DecorationsHolder( decorations )
	);
}
