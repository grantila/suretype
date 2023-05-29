import type { If, Is, And, Extends, GreaterThan, LengthOf } from "meta-types"

import { Type } from "../types.js"
import { ValueValidator } from "../value/validator.js"
import { isOptional } from "../optional/validator.js"
import { CoreValidator, TreeTraverser } from "../core/validator.js"
import { AnyValidator } from "../any/validator.js"
import { DuplicateConstraintError } from "../../errors.js"
import { ArrayOf, ArrayOfWithRest } from "../array-types.js"
import { TypeOf, Writeable } from "../functional.js"


export class TupleValidator<
	T extends any[ ],
	U extends CoreValidator< unknown >[ ],
	N extends number, // First optional index
	A extends false | CoreValidator< unknown > // Additional elements
>
	extends ValueValidator< T, TupleValidator< T, U, N, A > >
{
	protected type: Type = "array";
	private _unique: undefined | boolean = undefined;
	private _numRequired: number;
	private _minItems: undefined | number = undefined;
	private _maxItems: undefined | number = undefined;
	private _contains: CoreValidator< unknown > | undefined = undefined;
	private _additional: CoreValidator< unknown > | undefined = undefined;

	constructor( private validators: ReadonlyArray< CoreValidator< any > > )
	{
		super( );

		this._numRequired = TupleValidator.findMinItems( validators );
	}

	public const< V extends readonly T[ number ][ ] >( value: V )
	: TupleValidator< Writeable< typeof value >, U, N, A >
	{
		return super.const( value as Writeable< V[ number ] > as T ) as any;
	}

	public enum< V extends readonly T[ number ][ ] >( ...values: V[ ] )
	: TupleValidator< Writeable< ( typeof values )[ number ] >, U, N, A >
	{
		return super.enum( ...values as Writeable< V > ) as any;
	}

	private static findMinItems(
		validators: ReadonlyArray< CoreValidator< any > >
	)
	: number
	{
		for ( let i = validators.length - 1; i >= 0; --i )
		{
			if ( !isOptional( validators[ i ] ) )
				return i + 1;
		}
		return 0;
	}

	/**
	 * ## Minimum number of items
	 */
	public minItems< N2 extends number >( min: N2 )
	:
		N2 extends N
		? this
		: GreaterThan< N, N2 > extends true
		? never
		: And<
				Extends< A, false >,
				GreaterThan< N2, LengthOf< U > >
			> extends true
		? never
		: TupleValidator<
			If<
				Is< A, false >,
				ArrayOf< U, N2 >,
				ArrayOfWithRest< U, TypeOf< A >, N2 >
			>,
			U,
			N2,
			A
		>
	{
		if ( this._minItems !== undefined )
			throw new DuplicateConstraintError( "minItems" );

		if ( min < this._numRequired )
			throw new RangeError(
				"minItems cannot be smaller than {required}"
			);

		if ( this._maxItems !== undefined && this._maxItems < min )
			throw new RangeError( "minItems cannot be larger than maxItems" );

		const clone = this.clone( );
		clone._minItems = Math.max( min, this._numRequired );
		return clone as any;
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

		if ( this._numRequired > max )
			throw new RangeError(
				"maxItems cannot be smaller than {required}"
			);

		const clone = this.clone( );
		clone._maxItems = max;
		return clone;
	}

	/**
	 * ## Additional items
	 *
	 * `type` can be:
	 *   * **`true`**: Any additional items
	 *   * **`false`**: No additional items (default)
	 *   * **a sub-validator**: Additional items are allowed of a certain type
	 */
	public additional< A extends boolean >( type: A )
	:
		typeof type extends false
		? this
		: TupleValidator< ArrayOfWithRest< U, any, N >, U, N, AnyValidator >;
	public additional< B extends CoreValidator< unknown > >( type: B )
	:
		TupleValidator<
			ArrayOfWithRest< U, TypeOf< B >, N >,
			U,
			N,
			B
		>;
	public additional< B extends boolean, T2 >( type: B | CoreValidator< T2 > )
	:
		B extends false
		? this
		: typeof type extends CoreValidator< unknown >
		? TupleValidator<
			ArrayOfWithRest< U, T2, N >,
			U,
			N,
			CoreValidator< T2 >
		>
		: TupleValidator< ArrayOfWithRest< U, any, N >, U, N, AnyValidator >
	{
		if ( this._additional !== undefined )
			throw new DuplicateConstraintError( "additional" );

		const clone = this.clone( );
		clone._additional =
			type === true
			? new AnyValidator( )
			: type === false
			? undefined
			: type as CoreValidator< T2 >;
		return clone as any;
	}

	public contains( validator: CoreValidator< any > ): this
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
		const items = {
			items:
				this.validators.length === 0
				? this._additional === undefined
					? false
					: true
				: this.validators.map( validator =>
					traverser.visit( validator )
				)
		};

		const additionalItems = {
			additionalItems:
				this._additional === undefined
				? false
				: this._additional instanceof AnyValidator
				? true
				: traverser.visit( this._additional )
		};

		const contains = this._contains
			? { contains: traverser.visit( this._contains ) }
			: { };

		const minItems = this._minItems || this._numRequired
			? { minItems:
				Math.max( this._minItems ?? 0, this._numRequired ?? 0 )
			}
			: { };
		const maxItems = this._maxItems ? { maxItems: this._maxItems } : { };

		return {
			type: "array",
			...this.getJsonSchemaObject( traverser ),
			...items,
			...contains,
			...additionalItems,
			...minItems,
			...maxItems,
			...( this._unique ? { uniqueItems: true } : { } ),
		};
	}

	protected clone( clean: boolean = false )
	{
		const clone = this.setupClone(
			clean,
			new TupleValidator< T, U, N, A >( this.validators )
		);

		clone._unique = this._unique;
		clone._numRequired = this._numRequired;
		clone._minItems = this._minItems;
		clone._maxItems = this._maxItems;
		clone._contains = this._contains;
		clone._additional = this._additional;

		return clone;
	}
}
