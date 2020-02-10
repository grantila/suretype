import { AnyType } from "../types"
import { BaseValidator, TreeTraverser } from "../base/validator"


export class AnyOfValidator< T > extends BaseValidator< T, AnyOfValidator< T > >
{
	protected type: AnyType = "any-of";

	constructor( private validators: ReadonlyArray< BaseValidator< T > > )
	{
		super( );

		if ( validators.length === 0 )
			throw new RangeError(
				"any-of validators must have at least 1 item"
			);
	}

	protected toSchema( traverser: TreeTraverser )
	{
		return {
			...super.getJsonSchemaObject( traverser ),
			anyOf: this.validators.map( validator =>
				traverser.visit( validator )
			)
		};
	}

	protected clone( clean: boolean = false )
	{
		return this.setupClone(
			clean,
			new AnyOfValidator< T >( this.validators )
		);
	}
}
