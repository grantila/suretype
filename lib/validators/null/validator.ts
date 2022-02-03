import { Type } from "../types.js"
import { TreeTraverser } from "../core/validator.js"
import { ValueValidator } from "../value/validator.js"


export class NullValidator< T extends null = null >
	extends ValueValidator< T, NullValidator< T > >
{
	protected type: Type = "null";

	public const< V extends T >( value: V ): NullValidator< V >
	{
		return super.const( value ) as unknown as NullValidator< V >;
	}

	public enum< V extends readonly T[ ] >( ...values: V )
	: NullValidator< V[ number ] >
	{
		return super.enum( ...values ) as NullValidator< V[ number ] >;
	}

	protected toSchema( traverser: TreeTraverser )
	{
		return {
			type: "null",
			...this.getJsonSchemaObject( traverser ),
		};
	}

	protected clone( clean: boolean = false ): this
	{
		return this.setupClone( clean, new NullValidator( ) );
	}
}
