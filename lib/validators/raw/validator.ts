import { CoreValidator } from "../core/validator.js"
import {
	extractRequiredValidator,
	RequiredValidator,
} from "../required/validator.js"
import { AnyType } from "../types.js"


export class RawValidator extends CoreValidator< unknown >
{
	protected type: AnyType = 'raw';

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

	public required( ): RequiredValidator< unknown, this >
	{
		return new RequiredValidator( this );
	}

	protected clone( _clean: boolean = false ): this
	{
		return new RawValidator(
			JSON.parse( JSON.stringify( this.jsonSchema ) )
		) as this;
	}
}

export function isRaw( validator: CoreValidator< unknown > ): boolean
{
	return validator instanceof RawValidator;
}

export function getRaw( validator: CoreValidator< unknown > )
: RawValidator | undefined
{
	validator = extractRequiredValidator( validator );
	return isRaw( validator ) ? validator as RawValidator : undefined;
}
