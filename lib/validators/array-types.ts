import type {
	OptionalFrom,
	Last,
	Rest,
	Fill,
	ReverseRest,
	Overwrite
} from "meta-types"

import { BaseValidator } from "./base/validator.js"
import { ArrayValidator } from "./array/validator.js"
import { TupleValidator } from "./tuple/validator.js"
import type { TypeOf, IsOptional } from "./functional.js"


export type FirstOptionalIndex
	<
		T extends readonly unknown[ ],
		N extends number = T[ 'length' ]
	> =
		T extends [ ]
		? 0
		: IsOptional< Last< T > > extends false
		? N
		: FirstOptionalIndex< ReverseRest< T > >;

export type ExtractArray< T extends readonly unknown[ ] > =
	{
		R: [ TypeOf< T[ 0 ], true >, ...ExtractArray< Rest< T > > ];
		1: [ TypeOf< T[ 0 ], true > ];
		0: [ ];
	}[
		T[ 'length' ] extends 0 ? 0 : T[ 'length' ] extends 1 ? 1 : 'R'
	];

export type ArrayOf
	<
		T extends readonly unknown[ ],
		N extends number = FirstOptionalIndex< T >
	> =
		OptionalFrom< ExtractArray< T >, N >;

export type ArrayOfWithRest
	<
		T extends readonly unknown[ ],
		Rest,
		N extends number = FirstOptionalIndex< T >
	> =
		ArrayOfWithRestFilled<
			Overwrite<
				Fill< N, Rest >,
				ExtractArray< T >
			>,
			Rest,
			N
		>;

type ArrayOfWithRestFilled
	<
		T extends readonly unknown[ ],
		Rest,
		N extends number
	> =
		OptionalFrom< T, N > | [ ...T, ...Rest[ ] ];

export type EnsureArray< T > = T extends Array<infer U> ? T : [ T ];

export interface TupleFunction
{
	< T extends BaseValidator< unknown >[ ] >( types: [ ...T ] )
		: TupleValidator<
			ArrayOf< T >,
			typeof types,
			FirstOptionalIndex< T >,
			false
		>;
}

export type ArrayFunction =
	< U extends BaseValidator< unknown > >( itemType?: U ) =>
		ArrayValidator< Array< TypeOf< U > > >;
