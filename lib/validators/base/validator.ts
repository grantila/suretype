import { AnyType } from "../types"
import { AnnotationsHolder } from "../../annotations"


export interface TreeTraverser
{
	visit( validator: BaseValidator< unknown, any > ): any;
	getSchema( ): { schema: any; duplicates: Map< string, number >; };
	currentSchemaName: string | undefined;
}

export abstract class BaseValidator<
	T,
	U extends BaseValidator< T, U > = BaseValidator< T, any >
>
{
	protected _parent: this | undefined = undefined;

	protected _annotations: AnnotationsHolder | undefined = undefined;

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
		if ( !this._annotations )
			return { };

		const { title, description, examples } = this._annotations.options;

		return {
			...( title ? { title } : { } ),
			...( description ? { description } : { } ),
			...( examples ? { examples } : { } ),
		};
	}
}
