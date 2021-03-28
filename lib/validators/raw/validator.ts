import { AnyType } from "../types"
import { BaseValidator } from "../base/validator"


export class RawValidator extends BaseValidator< unknown, RawValidator >
{
	protected type: AnyType = 'any';

	public constructor( private jsonSchema: any )
	{
		super( );
	}

	protected toSchema( )
	{
		return this.jsonSchema;
	}

	protected clone( clean: boolean = false ): this
	{
		return this.setupClone(
			clean,
			new RawValidator(
				JSON.parse( JSON.stringify( this.jsonSchema ) )
			)
		);
	}
}
