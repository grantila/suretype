import { Type } from "../types"
import { TreeTraverser } from "../base/validator"
import { ValueValidator } from "../value/validator"


export class BooleanValidator< T extends boolean = boolean >
	extends ValueValidator< T, BooleanValidator< T > >
{
	protected type: Type = "boolean";

	public const< V extends T >( value: V ): BooleanValidator< V >
	{
		return super.const( value ) as unknown as BooleanValidator< V >;
	}

	public enum< V extends T[ ] >( ...values: V )
	: BooleanValidator< V[ number ] >
	{
		return super.enum( ...values ) as BooleanValidator< V[ number ] >;
	}

	protected toSchema( traverser: TreeTraverser )
	{
		return {
			type: "boolean",
			...this.getJsonSchemaObject( traverser ),
		};
	}

	protected clone( clean: boolean = false ): this
	{
		return this.setupClone( clean, new BooleanValidator( ) );
	}
}
