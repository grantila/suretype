import type { AnyType } from "./validators/types"
import {
	CoreValidator,
	exposeCoreValidator,
	TreeTraverser,
} from "./validators/core/validator"
import {
	BaseValidator,
	exposeBaseValidator,
} from "./validators/base/validator"
import { isRaw } from "./validators/raw/validator"


export function validatorToSchema< T extends CoreValidator< unknown > >(
	validator: T,
	traverser: TreeTraverser
)
{
	return exposeCoreValidator( validator ).toSchema( traverser );
}

export function validatorType< T extends BaseValidator< unknown > >(
	validator: T
): AnyType
{
	return exposeBaseValidator( validator ).type;
}

export function cloneValidator< T extends CoreValidator< unknown > >(
	validator: T,
	clean: boolean
): T
{
	return exposeCoreValidator( validator ).clone( clean ) as unknown as T;
}

const schemaLookup = new WeakMap< Function, CoreValidator< unknown > >( );

export function attachSchemaToValidator< Fn extends Function >(
	validator: Fn,
	schema: CoreValidator< unknown >
)
: typeof validator
{
	schemaLookup.set( validator, schema );
	return validator;
}

export function getValidatorSchema( val: any )
: CoreValidator< unknown > | undefined
{
	if ( val && val instanceof CoreValidator )
		return val;

	// Maybe validator function
	if ( val && val instanceof Function )
		return schemaLookup.get( val );

	return undefined;
}

export function uniqValidators( validators: Array< CoreValidator< unknown > > )
: typeof validators
{
	validators = [ ...new Set( validators ) ];

	return [
		...new Map(
			validators.map( validator =>
				isRaw( validator )
				? [ validator.toSchema( ), validator ]
				: [ { }, validator ]
			)
		)
		.values( )
	];
}
