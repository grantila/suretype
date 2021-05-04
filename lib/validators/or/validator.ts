import { AnyType } from "../types"
import { CoreValidator, TreeTraverser } from "../core/validator"
import { BaseValidator } from "../base/validator"
import { RequiredValidator } from "../required/validator"


export class AnyOfValidator< T > extends BaseValidator< T, AnyOfValidator< T > >
{
	protected type: AnyType = "any-of";

	constructor( private validators: ReadonlyArray< CoreValidator< T > > )
	{
		super( );

		if ( validators.length === 0 )
			throw new RangeError(
				"any-of validators must have at least 1 item"
			);
	}

	public required( ): RequiredValidator< T, this >
	{
		return new RequiredValidator( this );
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
