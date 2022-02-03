import { CoreValidator } from "./core/validator.js"
import { RequiredValidator } from "./required/validator.js"
import { SubType } from "./types.js"
import { TypeOf } from "./functional.js"


export type RequiredKeys<
		T extends { [ key: string ]: CoreValidator< unknown >; }
	> =
	SubType< T, RequiredValidator< any, any > >;

export type OptionalKeys<
		T extends { [ key: string ]: CoreValidator< unknown >; }
	> =
	SubType< T, RequiredValidator< any, any >, true >;

export type ExtractObject<
		T extends { [ key: string ]: CoreValidator< unknown >; }
	> =
	{
		[ P in keyof RequiredKeys< T > ]-?: TypeOf< T[ P ], true > & unknown;
	}
	&
	{
		[ P in keyof OptionalKeys< T > ]+?: TypeOf< T[ P ] > & unknown;
	};
