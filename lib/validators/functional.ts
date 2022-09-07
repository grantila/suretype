import { CoreValidator } from "./core/validator.js"
import { BaseValidator } from "./base/validator.js"
import { ValueValidator } from "./value/validator.js"
import { BooleanValidator } from "./boolean/validator.js"
import { NumberValidator } from "./number/validator.js"
import { StringValidator } from "./string/validator.js"
import { NullValidator } from "./null/validator.js"
import { AnyValidator } from "./any/validator.js"
import { ObjectValidator } from "./object/validator.js"
import { ArrayValidator } from "./array/validator.js"
import { TupleValidator } from "./tuple/validator.js"
import { AnyOfValidator } from "./or/validator.js"
import { AllOfValidator } from "./all-of/validator.js"
import { IfValidator, ThenValidator, ElseValidator } from "./if/validator.js"
import { RequiredValidator } from "./required/validator.js"
import { RawValidator } from "./raw/validator.js"
import { RecursiveValidator } from "./recursive/validator.js"
import { RecursiveValue } from "./types.js"


export type IsRequired< T > =
	T extends RequiredValidator< infer U, infer _ > ? true : false;

export type ExtractRequired< T > =
	T extends RequiredValidator< infer U, infer _ > ? U : never;

export type ValuesOf< T extends { } > = T[ keyof T ] & unknown;

export type FlattenObject< T > = { [ K in keyof T ]: T[ K ] & unknown; };

export type AdditionalProperties< T extends { }, U > =
	FlattenObject< T & Record< string, U | ValuesOf< T > > >;

export type TypeOf< T, InclRequired = false > =
	T extends ObjectValidator< infer U >
	? FlattenObject< U >
	: T extends TupleValidator< infer U, infer V, infer N, infer A >
	? U
	: T extends ArrayValidator< infer U >
	? U
	: T extends StringValidator< infer U >
	? U
	: T extends NumberValidator< infer U >
	? U
	: T extends BooleanValidator< infer U >
	? U
	: T extends NullValidator< infer U >
	? U
	: T extends AnyValidator< infer U >
	? U
	: T extends RecursiveValidator
	? RecursiveValue
	: T extends RawValidator
	? unknown
	: T extends AnyOfValidator< infer U >
	? U
	: T extends AllOfValidator< infer U >
	? U
	: T extends ElseValidator< infer U >
	? U
	: T extends ThenValidator< infer U >
	? U
	: T extends IfValidator< infer U >
	? U
	: T extends ValueValidator< infer U, infer V >
	? U
	: T extends RequiredValidator< infer U, infer _ >
	?
		InclRequired extends true
		? U
		: never
	: T extends BaseValidator< infer U >
	? U
	: T extends CoreValidator< infer U >
	? U
	: never;

export type Writeable< T > = { -readonly [ P in keyof T ]: T[ P ] };
