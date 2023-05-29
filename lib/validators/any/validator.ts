import { AnyType } from "../types.js"
import { TreeTraverser } from "../core/validator.js"
import { BaseValidator } from "../base/validator.js"
import { OptionalValidator } from "../optional/validator.js"


export class AnyValidator< T extends any | unknown = any >
	extends BaseValidator< T, AnyValidator< T > >
{
	protected type: AnyType = "any";

	public optional( ): OptionalValidator< T, this >
	{
		return new OptionalValidator( this );
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
