import { AnyType } from "../types"
import { DecorationsHolder } from "../decorations"


export interface TreeTraverser
{
	visit( validator: BaseValidator< unknown, any > ): any;
	getSchema( ): { schema: any; duplicates: Map< string, number >; };
}

export abstract class BaseValidator<
	T,
	U extends BaseValidator< T, U > = BaseValidator< T, any >
>
{
	protected _parent: this | undefined = undefined;

	protected _decorations: DecorationsHolder | undefined = undefined;

	protected abstract type: AnyType;

	protected abstract toSchema( traverser: TreeTraverser ): any;

	protected abstract clone( clean?: boolean ): this;

	protected setupClone( clean: boolean, clone: U ): this
	{
		const ret = clone as unknown as this;
		if ( !clean )
			ret._parent = this;
		return ret;
	}

	protected getJsonSchemaObject( traverser: TreeTraverser )
	{
		if ( !this._decorations )
			return { };

		const { title, description, examples } = this._decorations.options;

		return {
			...( title ? { title } : { } ),
			...( description ? { description } : { } ),
			...( examples ? { examples } : { } ),
		};
	}
}
