import { CoreValidator } from "../core/validator.js"
import {
	extractOptionalValidator,
	OptionalValidator,
} from "../optional/validator.js"
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

	public optional( ): OptionalValidator< unknown, this >
	{
		return new OptionalValidator( this );
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
	validator = extractOptionalValidator( validator );
	return isRaw( validator ) ? validator as RawValidator : undefined;
}
