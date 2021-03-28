import { AnyType } from "../types"
import { TreeTraverser } from "../core/validator"
import { BaseValidator } from "../base/validator"
import { validatorType, cloneValidator } from "../../validation"


export class RequiredValidator< T, U extends BaseValidator< T > >
	extends BaseValidator< T, RequiredValidator< T, U > >
{
	constructor( private validator: U )
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

export function isRequired( validator: BaseValidator< unknown > )
{
	return validator instanceof RequiredValidator;
}
