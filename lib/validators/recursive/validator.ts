import { AnyType } from "../types.js"
import { TreeTraverser } from "../core/validator.js"
import { BaseValidator } from "../base/validator.js"
import { RequiredValidator } from "../required/validator.js"


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
