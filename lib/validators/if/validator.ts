import { AnyType } from "../types"
import { TreeTraverser } from "../core/validator"
import { BaseValidator } from "../base/validator"
import { TypeOf } from "../functional"


export class ElseValidator< T > extends BaseValidator< T, ElseValidator< T > >
{
	protected type: AnyType = "if";
	protected _if: undefined | BaseValidator< unknown > = undefined;
	protected _then: undefined | BaseValidator< unknown > = undefined;
	protected _else: undefined | BaseValidator< unknown > = undefined;

	protected constructor( )
	{
		super( );
	}

	protected toSchema( traverser: TreeTraverser )
	{
		return {
			...super.getJsonSchemaObject( traverser ),
			if: traverser.visit( this._if as BaseValidator< unknown > ),
			...( this._then ? { then: traverser.visit( this._then ) } : { } ),
			...( this._else ? { else: traverser.visit( this._else ) } : { } ),
		};
	}

	protected clone( clean: boolean = false )
	{
		const child = new ElseValidator< T >( );
		if ( !clean )
		{
			child._if = this._if;
			child._then = this._then;
			child._else = this._else;
		}
		return this.setupClone( clean, child );
	}
}

export class ThenValidator< T > extends ElseValidator< T >
{
	protected type: AnyType = "if";

	protected constructor( )
	{
		super( );
	}

	public else< U extends BaseValidator< unknown > >( validator: U )
	: ElseValidator< T | TypeOf< U > >
	{
		const then = new ElseValidator< U >( );

		( then as ThenValidator< U > )._if = this._if;
		( then as ThenValidator< U >  )._then = this._then;
		( then as ThenValidator< U >  )._else = validator;

		return then;
	}

	protected clone( clean: boolean = false ): this
	{
		const child = new ThenValidator< T >( );
		if ( !clean )
		{
			child._if = this._if;
			child._then = this._then;
			child._else = this._else;
		}
		return this.setupClone( clean, child );
	}
}

export class IfValidator< T > extends ThenValidator< unknown >
{
	protected type: AnyType = "if";
	protected _if: BaseValidator< unknown >;

	constructor( validator: BaseValidator< T > )
	{
		super( );

		this._if = validator;
	}

	public then< U extends BaseValidator< unknown > >( validator: U )
	: ThenValidator< TypeOf< U > >
	{
		const then = new ThenValidator< U >( );

		( then as IfValidator< U > )._if = this._if;
		( then as IfValidator< U > )._then = validator;

		return then;
	}

	protected clone( clean: boolean = false ): this
	{
		return this.setupClone( clean, new IfValidator< T >( this._if ) );
	}
}
