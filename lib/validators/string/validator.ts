import { Type } from "../types"
import { TreeTraverser } from "../base/validator"
import { ValueValidator } from "../value/validator"
import { Formats } from "./types"
import { objectOf } from "../../utils"
import { DuplicateConstraintError } from "../../errors"


export class StringValidator< T extends string = string >
	extends ValueValidator< T, StringValidator< T > >
{
	protected type: Type = "string";
	private _min: undefined | number = undefined;
	private _max: undefined | number = undefined;
	private _pattern: undefined | string = undefined;
	private _format: undefined | Formats = undefined;

	protected chainedMinLength( ): number | undefined
	{
		return this._min ?? this._parent?.chainedMinLength( );
	}

	protected chainedMaxLength( ): number | undefined
	{
		return this._max ?? this._parent?.chainedMaxLength( );
	}

	protected chainedPattern( ): string | undefined
	{
		return this._pattern ?? this._parent?.chainedPattern( );
	}

	protected chainedFormat( ): Formats | undefined
	{
		return this._format ?? this._parent?.chainedFormat( );
	}

	public const< V extends T >( value: V ): StringValidator< V >
	{
		return super.const( value ) as unknown as StringValidator< V >;
	}

	public enum< V extends readonly T[ ] >( ...values: V )
	: StringValidator< V[ number ] >
	{
		return super.enum( ...values ) as StringValidator< V[ number ] >;
	}

	public minLength( n: number )
	{
		if ( this.chainedMinLength( ) !== undefined )
			throw new DuplicateConstraintError( "minLength" );

		const clone = this.clone( );
		clone._min = n;
		return clone;
	}

	public maxLength( n: number )
	{
		if ( this.chainedMaxLength( ) !== undefined )
			throw new DuplicateConstraintError( "maxLength" );

		const clone = this.clone( );
		clone._max = n;
		return clone;
	}

	public matches( regex: string | RegExp )
	{
		if ( this.chainedPattern( ) !== undefined )
			throw new DuplicateConstraintError( "matches" );

		const clone = this.clone( );
		if ( typeof regex === "string" )
			clone._pattern = regex;
		else
			clone._pattern = regex.source;
		return clone;
	}

	public numeric( )
	{
		return this.matches( "^(0|-?([1-9][0-9]*)(\.[0-9]+)?)$" );
	}

	public format( format: Formats )
	{
		if ( this.chainedFormat( ) )
			throw new DuplicateConstraintError( "format" );

		const clone = this.clone( );
		clone._format = format;
		return clone;
	}

	protected toSchema( traverser: TreeTraverser )
	{
		return {
			type: "string",
			...this.getJsonSchemaObject( traverser ),
			...objectOf( this.chainedMinLength( ), "minLength" ),
			...objectOf( this.chainedMaxLength( ), "maxLength" ),
			...objectOf( this.chainedPattern( ), "pattern" ),
			...objectOf( this.chainedFormat( ), "format" ),
		};
	}

	protected clone( clean: boolean = false ): this
	{
		return this.setupClone( clean, new StringValidator( ) );
	}
}
