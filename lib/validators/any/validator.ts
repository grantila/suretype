import { AnyType } from "../types"
import { TreeTraverser } from "../core/validator"
import { BaseValidator } from "../base/validator"


export class AnyValidator< T extends any | unknown = any >
	extends BaseValidator< T, AnyValidator< T > >
{
	protected type: AnyType = "any";

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
