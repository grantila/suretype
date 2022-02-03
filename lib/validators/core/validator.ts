import { AnnotationsHolder } from "../../annotations.js"
import { AnyType } from "../types.js"


export interface TreeTraverser
{
	visit( validator: CoreValidator< unknown > ): any;
	getSchema( ): { schema: any; duplicates: Map< string, number >; };
	currentSchemaName: string | undefined;
}

export abstract class CoreValidator< T >
{
	protected _annotations: AnnotationsHolder | undefined = undefined;

	protected abstract toSchema( traverser: TreeTraverser ): any;

	protected abstract clone( clean?: boolean ): this;

	protected abstract type: AnyType;

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

export abstract class InternalCoreValidator extends CoreValidator< unknown >
{
	public _annotations: AnnotationsHolder | undefined = undefined;
	public abstract type: AnyType;
	public abstract toSchema( traverser: TreeTraverser ): any;
	public abstract clone( clean?: boolean ): this;
}

export function exposeCoreValidator< T extends CoreValidator< unknown > >(
	validator: T
)
: InternalCoreValidator
{
	return validator as unknown as InternalCoreValidator;
}
