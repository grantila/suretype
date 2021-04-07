import { AnyType } from "../types"
import { TreeTraverser } from "../core/validator"
import { BaseValidator } from "../base/validator"
import { RequiredValidator } from "../required/validator"


export class AnyValidator< T extends any | unknown = any >
	extends BaseValidator< T, AnyValidator< T > >
{
	protected type: AnyType = "any";

	public required( ): RequiredValidator< T, this >
	{
		return new RequiredValidator( this );
	}

	protected toSchema( traverser: TreeTraverser )
	{
		return {
			...super.getJsonSchemaObject( traverser ),
		};
	}

	protected clone( clean: boolean = false )
	{
		return this.setupClone( clean, new AnyValidator< T >( ) );
	}
}
