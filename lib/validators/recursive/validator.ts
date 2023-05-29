import { AnyType } from "../types.js"
import { TreeTraverser } from "../core/validator.js"
import { BaseValidator } from "../base/validator.js"
import { OptionalValidator } from "../optional/validator.js"


export class RecursiveValidator
	extends BaseValidator< unknown, RecursiveValidator >
{
	protected type: AnyType = 'recursive';

	public optional( ): OptionalValidator< RecursiveValidator, this >
	{
		return new OptionalValidator( this );
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
