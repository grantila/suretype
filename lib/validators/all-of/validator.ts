import { AnyType } from "../types.js"
import { CoreValidator, TreeTraverser } from "../core/validator.js"
import { BaseValidator } from "../base/validator.js"
import { RequiredValidator } from "../required/validator.js"


export class AllOfValidator< T > extends BaseValidator< T, AllOfValidator< T > >
{
	protected type: AnyType = "all-of";

	constructor( private validators: ReadonlyArray< CoreValidator< T > > )
	{
		super( );

		if ( validators.length === 0 )
			throw new RangeError(
				"all-of validators must have at least 1 item"
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
