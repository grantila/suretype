import { Type } from "../types"
import { TreeTraverser } from "../core/validator"
import { ValueValidator } from "../value/validator"
import { objectOf } from "../../utils"
import { DuplicateError, DuplicateConstraintError } from "../../errors"


export class NumberValidator< T extends number = number >
	extends ValueValidator< T, NumberValidator< T > >
{
	protected type: Type = "number";

	private _multipleOf: undefined | number = undefined;
	private _gt: undefined | number = undefined;
	private _gte: undefined | number = undefined;
	private _lt: undefined | number = undefined;
	private _lte: undefined | number = undefined;

	protected chainedGt( ): number | undefined
	{
		return this._gt ?? this._parent?.chainedGt( );
	}

	protected chainedGte( ): number | undefined
	{
		return this._gte ?? this._parent?.chainedGte( );
	}

	protected chainedLt( ): number | undefined
	{
		return this._lt ?? this._parent?.chainedLt( );
	}

	protected chainedLte( ): number | undefined
	{
		return this._lte ?? this._parent?.chainedLte( );
	}

	protected chainedMultipleOf( ): number | undefined
	{
		return this._multipleOf ?? this._parent?.chainedMultipleOf( );
	}

	public const< V extends T >( value: V ): NumberValidator< V >
	{
		return super.const( value ) as unknown as NumberValidator< V >;
	}

	public enum< V extends T[ ] >( ...values: V )
	: NumberValidator< V[ number ] >
	{
		return super.enum( ...values ) as NumberValidator< V[ number ] >;
	}

	public gt( n: number )
	{
		const prev = this.chainedGt( );
		const prevPair = this.chainedGte( );
		if ( prevPair !== undefined )
			throw new DuplicateError( "Cannot set gt when gte is set." );
		if ( prev !== undefined )
			throw new DuplicateConstraintError( "gt" );

		const clone = this.clone( );
		clone._gt = n;
		return clone;
	}

	public gte( n: number )
	{
		const prev = this.chainedGte( );
		const prevPair = this.chainedGt( );
		if ( prevPair !== undefined )
			throw new DuplicateError( "Cannot set gte when gt is set." );
		if ( prev !== undefined )
			throw new DuplicateConstraintError( "gte" );

		const clone = this.clone( );
		clone._gte = n;
		return clone;
	}

	public lt( n: number )
	{
		const prev = this.chainedLt( );
		const prevPair = this.chainedLte( );
		if ( prevPair !== undefined )
			throw new DuplicateError( "Cannot set lt when lte is set." );
		if ( prev !== undefined )
			throw new DuplicateConstraintError( "lt" );

		const clone = this.clone( );
		clone._lt = n;
		return clone;
	}

	public lte( n: number )
	{
		const prev = this.chainedLte( );
		const prevPair = this.chainedLt( );
		if ( prevPair !== undefined )
			throw new DuplicateError( "Cannot set lte when lt is set." );
		if ( prev !== undefined )
			throw new DuplicateConstraintError( "lte" );

		const clone = this.clone( );
		clone._lte = n;
		return clone;
	}

	public integer( )
	{
		const clone = this.clone( );
		clone.type = "integer";
		return clone;
	}

	public multipleOf( mul: number )
	{
		if ( this.chainedMultipleOf( ) !== undefined )
			throw new DuplicateConstraintError( "multipleOf" );

		const clone = this.clone( );
		clone._multipleOf = mul;
		return clone;
	}

	protected toSchema( traverser: TreeTraverser )
	{
		return {
			type: this.type,
			...this.getJsonSchemaObject( traverser ),
			...objectOf( this.chainedMultipleOf( ), "multipleOf" ),
			...objectOf( this.chainedGt( ), "exclusiveMinimum" ),
			...objectOf( this.chainedGte( ), "minimum" ),
			...objectOf( this.chainedLt( ), "exclusiveMaximum" ),
			...objectOf( this.chainedLte( ), "maximum" ),
		};
	}

	protected clone( clean: boolean = false ): this
	{
		const clone = new NumberValidator< T >( );
		if ( !clean )
			clone.type = this.type;
		return this.setupClone( clean, clone );
	}
}
