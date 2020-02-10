import { BaseValidator } from "./base/validator"
import { ValueValidator } from "./value/validator"
import { BooleanValidator } from "./boolean/validator"
import { NumberValidator } from "./number/validator"
import { StringValidator } from "./string/validator"
import { NullValidator } from "./null/validator"
import { AnyValidator } from "./any/validator"
import { ObjectValidator } from "./object/validator"
import { ArrayValidator } from "./array/validator"
import { TupleValidator } from "./tuple/validator"
import { AnyOfValidator } from "./or/validator"
import { AllOfValidator } from "./all-of/validator"
import { IfValidator, ThenValidator, ElseValidator } from "./if/validator"
import { RequiredValidator } from "./required/validator"


export type IsRequired< T > =
	T extends RequiredValidator< infer U, infer _ > ? true : false;

export type ExtractRequired< T > =
	T extends RequiredValidator< infer U, infer _ > ? U : never;

export type FlattenObject< T, P extends keyof T = keyof T > =
	{
		[ K in P ]: T[ K ];
	};

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
	: T extends AnyValidator
	? any
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
	: never;

export type Writeable< T > = { -readonly [ P in keyof T ]: T[ P ] };
