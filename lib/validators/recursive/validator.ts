import { AnyType } from "../types"
import { BaseValidator, TreeTraverser } from "../base/validator"
import { RequiredValidator } from "../required/validator"


export class RecursiveValidator
	extends BaseValidator< unknown, RecursiveValidator >
{
	protected type: AnyType = 'recursive';

	public required( ): RequiredValidator< RecursiveValidator, this >
	{
		return new RequiredValidator( this );
	}

	protected toSchema( traverser: TreeTraverser )
	{
		return {
			$ref: `#/definitions/${traverser.currentSchemaName}`,
			...this.getJsonSchemaObject( traverser ),
		};
	}

	protected clone( clean: boolean = false ): this
	{
		return super.setupClone( clean, new RecursiveValidator( ) );
	}
}
