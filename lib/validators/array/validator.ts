import { Type } from "../types"
import { ValueValidator } from "../value/validator"
import { BaseValidator, TreeTraverser } from "../base/validator"
import { DuplicateConstraintError } from "../../errors"
import { Writeable } from "../functional"


// NOTE:
// "Additional items" are not implemented for array, only tuple-types.

export class ArrayValidator< T extends Array< any > >
	extends ValueValidator< T, ArrayValidator< T > >
{
	protected type: Type = "array";
	private _unique: undefined | boolean = undefined;
	private _minItems: undefined | number = undefined;
	private _maxItems: undefined | number = undefined;
	private _contains: BaseValidator< unknown > | undefined = undefined;

	constructor( private validator: BaseValidator< any > )
	{
		super( );
	}

	public const< V extends readonly T[ number ][ ] >( value: V )
	: ArrayValidator< Writeable< typeof value > >
	{
		return super.const( value as Writeable< V[ number ] > as T ) as any;
	}

	public enum< V extends readonly T[ number ][ ] >( ...values: V[ ] )
	: ArrayValidator< Writeable< ( typeof values )[ number ] > >
	{
		return super.enum( ...values as Writeable< V > ) as any;
	}

	/**
	 * ## Minimum number of items
	 */
	public minItems( min: number ): this
	{
		if ( this._minItems !== undefined )
			throw new DuplicateConstraintError( "minItems" );

		if ( this._maxItems !== undefined && this._maxItems < min )
			throw new RangeError( "minItems cannot be larger than maxItems" );

		const clone = this.clone( );
		clone._minItems = min;
		return clone;
	}

	/**
	 * ## Maximum number of items
	 */
	public maxItems( max: number ): this
	{
		if ( this._maxItems !== undefined )
			throw new DuplicateConstraintError( "maxItems" );

		if ( this._minItems !== undefined && this._minItems > max )
			throw new RangeError( "maxItems cannot be smaller than minItems" );

		const clone = this.clone( );
		clone._maxItems = max;
		return clone;
	}

	public contains( validator: BaseValidator< any > ): this
	{
		if ( this._contains !== undefined )
			throw new DuplicateConstraintError( "contains" );

		const clone = this.clone( );
		clone._contains = validator;
		return clone;
	}

	public unique( unique = true )
	{
		const clone = this.clone( );
		clone._unique = unique;
		return clone;
	}

	protected toSchema( traverser: TreeTraverser )
	{
		const contains = this._contains
			? { contains: traverser.visit( this._contains ) }
			: { };

		const minItems = this._minItems ? { minItems: this._minItems } : { };
		const maxItems = this._maxItems ? { maxItems: this._maxItems } : { };

		return {
			type: "array",
			...this.getJsonSchemaObject( traverser ),
			items: traverser.visit( this.validator ),
			...contains,
			...minItems,
			...maxItems,
			...( this._unique ? { uniqueItems: true } : { } ),
		};
	}

	protected clone( clean: boolean = false )
	{
		const clone = this.setupClone(
			clean,
			new ArrayValidator< T >( this.validator )
		);

		clone._unique = this._unique;
		clone._minItems = this._minItems;
		clone._maxItems = this._maxItems;
		clone._contains = this._contains;

		return clone;
	}
}
