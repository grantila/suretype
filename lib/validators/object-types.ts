import { BaseValidator } from "./base/validator"
import { RequiredValidator } from "./required/validator"
import { SubType } from "./types"
import { TypeOf } from "./functional"


export type RequiredKeys<
		T extends { [ key: string ]: BaseValidator< unknown >; }
	> =
	SubType< T, RequiredValidator< any, any > >;

export type OptionalKeys<
		T extends { [ key: string ]: BaseValidator< unknown >; }
	> =
	SubType< T, RequiredValidator< any, any >, true >;

export type ExtractObject<
		T extends { [ key: string ]: BaseValidator< unknown >; }
	> =
	{
		[ P in keyof RequiredKeys< T > ]-?: TypeOf< T[ P ], true > & unknown;
	}
	&
	{
		[ P in keyof OptionalKeys< T > ]+?: TypeOf< T[ P ] > & unknown;
	};
