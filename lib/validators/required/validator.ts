import { AnyType } from "../types.js"
import { CoreValidator, TreeTraverser } from "../core/validator.js"
import { BaseValidator } from "../base/validator.js"
import { validatorType, cloneValidator } from "../../validation.js"


export class RequiredValidator< T, U extends CoreValidator< T > >
	extends BaseValidator< T, RequiredValidator< T, U > >
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
		return new RequiredValidator< T, U >( clonedInner ) as this;
	}
}

export abstract class InternalRequiredValidator
	extends RequiredValidator< unknown, CoreValidator< unknown > >
{
	public abstract validator: CoreValidator< unknown >;
}

export function isRequired( validator: CoreValidator< unknown > )
{
	return validator instanceof RequiredValidator;
}

export function extractRequiredValidator( validator: CoreValidator< unknown > )
: CoreValidator< unknown >
{
	return validator instanceof RequiredValidator
		? ( validator as InternalRequiredValidator ).validator
		: validator;
}
