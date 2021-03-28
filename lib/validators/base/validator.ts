import { AnyType } from "../types"
import {
	CoreValidator,
	InternalCoreValidator,
	TreeTraverser,
} from "../core/validator"
import { AnnotationsHolder } from "../../annotations"


export abstract class BaseValidator
	<
		T,
		U extends BaseValidator< T, U > = BaseValidator< T, any >
	>
	extends CoreValidator< T >
{
	protected _parent: this | undefined = undefined;

	protected abstract type: AnyType;

	protected setupClone( clean: boolean, clone: U ): this
	{
		const ret = clone as unknown as this;
		if ( !clean )
			ret._parent = this;
		return ret;
	}
}

export abstract class InternalBaseValidator
	extends BaseValidator< unknown, any >
	implements InternalCoreValidator
{
	// CoreValidator
	public _annotations: AnnotationsHolder | undefined = undefined;
	public abstract toSchema( traverser: TreeTraverser ): any;
	public abstract clone( clean?: boolean ): this;

	// BaseValidator
	public _parent: this | undefined = undefined;
	public abstract type: AnyType;
	public abstract setupClone( clean: boolean, clone: any ): this;
}

export function exposeBaseValidator< T extends BaseValidator< unknown > >(
	validator: T
)
: InternalBaseValidator
{
	return validator as unknown as InternalBaseValidator;
}
