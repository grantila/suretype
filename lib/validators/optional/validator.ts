import { AnyType } from "../types.js"
import { CoreValidator, TreeTraverser } from "../core/validator.js"
import { BaseValidator } from "../base/validator.js"
import { validatorType, cloneValidator } from "../../validation.js"


export class OptionalValidator< T, U extends CoreValidator< T > >
	extends BaseValidator< T, OptionalValidator< T, U > >
{
	constructor( protected validator: U )
	{
		super( );
	}

	protected get type( ): AnyType
	{
		return validatorType( this.validator );
	}

	protected toSchema( traverser: TreeTraverser )
	{
		return {
			...super.getJsonSchemaObject( traverser ),
			...traverser.visit( this.validator )
		};
	}

	protected clone( clean: boolean = false )
	{
		const clonedInner = cloneValidator( this.validator, clean );
		return new OptionalValidator< T, U >( clonedInner ) as this;
	}
}

export abstract class InternalOptionalValidator
	extends OptionalValidator< unknown, CoreValidator< unknown > >
{
	public abstract validator: CoreValidator< unknown >;
}

export function isOptional( validator: CoreValidator< unknown > )
{
	return validator instanceof OptionalValidator;
}

export function extractOptionalValidator( validator: CoreValidator< unknown > )
: CoreValidator< unknown >
{
	return validator instanceof OptionalValidator
		? ( validator as InternalOptionalValidator ).validator
		: validator;
}
