import { AnyType } from "../types"
import { TreeTraverser } from "../core/validator"
import { BaseValidator } from "../base/validator"


export class AllOfValidator< T > extends BaseValidator< T, AllOfValidator< T > >
{
	protected type: AnyType = "all-of";

	constructor( private validators: ReadonlyArray< BaseValidator< T > > )
	{
		super( );

		if ( validators.length === 0 )
			throw new RangeError(
				"all-of validators must have at least 1 item"
			);
	}

	protected toSchema( traverser: TreeTraverser )
	{
		return {
			...super.getJsonSchemaObject( traverser ),
			allOf: this.validators.map( validator =>
				traverser.visit( validator )
			)
		};
	}

	protected clone( clean: boolean = false )
	{
		return this.setupClone(
			clean,
			new AllOfValidator< T >( this.validators )
		);
	}
}
