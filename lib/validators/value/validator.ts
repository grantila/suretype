import { Type } from "../types.js"
import { TreeTraverser } from "../core/validator.js"
import { BaseValidator } from "../base/validator.js"
import { DuplicateConstraintError, DuplicateError } from "../../errors.js"
import { RequiredValidator } from "../required/validator.js"


export abstract class ValueValidator< T, U extends ValueValidator< T, U > >
	extends BaseValidator< T, U >
{
	protected abstract type: Type;
	private _default: T | undefined = undefined;
	private _constValue: undefined | T = undefined;
	private _enumValues: undefined | Array< T > = undefined;
	private _anyOf: undefined | Array< BaseValidator< unknown > > = undefined;
	private _allOf: undefined | Array< BaseValidator< unknown > > = undefined;

	/**
	 * ## One fixed value
	 *
	 * `const` is identical to an `enum` with only one entry, and is used to
	 * force an exact value of a type.
	 */
	protected const< V extends T >( value: V ): unknown
	{
		if ( this._constValue )
			throw new DuplicateConstraintError( "const" );
		if ( this._enumValues )
			throw new DuplicateError( "Cannot use both const and enum" );

		const clone = this.clone( );
		clone._constValue = value;
		return clone;
	}

	/**
	 * ## Enumerate values
	 *
	 * `enum` can be used to specify the exact set of values allowed, and is
	 * specified as individual arguments.
	 *
	 * By default, no enum is specified, meaning any value matching the *type*
	 * is allowed.
	 */
	protected enum( ...values: unknown[ ] ): unknown
	{
		if ( this._enumValues )
			throw new DuplicateConstraintError( "enum" );
		if ( this._constValue )
			throw new DuplicateError( "Cannot use both const and enum" );

		const clone = this.clone( );
		clone._enumValues = [ ...new Set( values as T[ ] ) ];
		return clone;
	}

	public default( value: T ): this
	{
		if ( this._default )
			throw new DuplicateConstraintError( "default" );

		const clone = this.clone( );
		clone._default = value;
		return clone;
	}

	public required( ): RequiredValidator< T, this >
	{
		return new RequiredValidator( this );
	}

	protected getConst( ): T | undefined
	{
		return this._constValue ?? this._parent?.getConst( );
	}

	protected getConstSchema( ): { }
	{
		const const_ = this.getConst( );
		if ( !const_ )
			return { };

		return { const: const_ };
	}

	protected getEnum( ): Array< T > | undefined
	{
		return this._enumValues ?? this._parent?.getEnum( );
	}

	protected getEnumSchema( ): { }
	{
		const enum_ = this.getEnum( );
		if ( !enum_ )
			return { };

		return enum_.length === 0 ? { } : { enum: enum_ };
	}

	public anyOf< V extends BaseValidator< unknown > >(
		condition: Array< V > | ( ( v: U ) => Array< V > )
	)
	: this
	{
		if ( this._anyOf )
			throw new DuplicateConstraintError( "anyOf" );

		const clone = this.clone( );

		clone._anyOf = typeof condition === "function"
			? condition( this.clone( true ) as unknown as U )
			: condition;
		if ( clone._anyOf.length === 0 )
			throw new RangeError( "anyOf must have at least 1 item" );

		return clone;
	}

	protected getAnyOf( ): Array< BaseValidator< unknown > > | undefined
	{
		return this._anyOf ?? this._parent?.getAnyOf( );
	}

	protected getAnyOfSchemaObject( traverser: TreeTraverser )
	{
		const anyOf = this.getAnyOf( );
		if ( !anyOf )
			return { };

		return {
			anyOf: anyOf.map( validator =>
				cleanFromTypeProperty( traverser.visit( validator ) )
			)
		};
	}

	public allOf< V extends BaseValidator< unknown > >(
		condition: Array< V > | ( ( v: U ) => Array< V > )
	)
	: this
	{
		if ( this._allOf )
			throw new DuplicateConstraintError( "allOf" );

		const clone = this.clone( );

		clone._allOf = typeof condition === "function"
			? condition( this.clone( true ) as unknown as U )
			: condition;
		if ( clone._allOf.length === 0 )
			throw new RangeError( "allOf must have at least 1 item" );

		return clone;
	}

	protected getAllOf( ): Array< BaseValidator< unknown > > | undefined
	{
		return this._allOf ?? this._parent?.getAllOf( );
	}

	protected getAllOfSchemaObject( traverser: TreeTraverser )
	{
		const allOf = this.getAllOf( );
		if ( !allOf )
			return { };

		return {
			allOf: allOf.map( validator =>
				cleanFromTypeProperty( traverser.visit( validator ) )
			)
		};
	}

	protected getDefault( ): T | undefined
	{
		return this._default ?? this._parent?.getDefault( );
	}

	protected getDefaultSchema( )
	{
		const default_ = this.getDefault( );
		if ( default_ === undefined )
			return { };
		return { default: default_ };
	}

	protected getJsonSchemaObject( traverser: TreeTraverser )
	{
		return {
			...super.getJsonSchemaObject( traverser ),
			...this.getConstSchema( ),
			...this.getEnumSchema( ),
			...this.getDefaultSchema( ),
			...this.getAnyOfSchemaObject( traverser ),
			...this.getAllOfSchemaObject( traverser ),
		};
	}

	protected setupClone( clean: boolean, clone: U ): this
	{
		const ret = clone as unknown as this;
		if ( !clean )
		{
			ret._enumValues = this._enumValues;
			ret._anyOf = this._anyOf;
			ret._allOf = this._allOf;
		}
		return super.setupClone( clean, clone );
	}
}

function cleanFromTypeProperty< T extends { type: any } >( t: T )
: Omit< T, "type" >
{
	const { type, ...ret } = t;
	return ret;
}
