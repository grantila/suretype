import { CoreValidator } from "../core/validator"


export class RawValidator extends CoreValidator< unknown >
{
	public constructor(
		private jsonSchema: any,
		public readonly fragment?: string
	)
	{
		super( );
	}

	public toSchema( )
	{
		return this.jsonSchema;
	}

	protected clone( _clean: boolean = false ): this
	{
		return new RawValidator(
			JSON.parse( JSON.stringify( this.jsonSchema ) )
		) as this;
	}
}

export function isRaw( validator: CoreValidator< unknown > )
: validator is RawValidator
{
	return validator instanceof RawValidator;
}
