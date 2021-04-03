import { AnyType } from "../types"
import { TreeTraverser } from "../core/validator"
import { BaseValidator } from "../base/validator"


export class AnyValidator extends BaseValidator< any, AnyValidator >
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
		return this.setupClone( clean, new AnyValidator( ) );
	}
}
