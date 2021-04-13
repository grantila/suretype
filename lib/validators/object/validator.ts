import { Type } from "../types"
import { TreeTraverser } from "../core/validator"
import { BaseValidator } from "../base/validator"
import { validatorType } from "../../validation"
import { ValueValidator } from "../value/validator"
import { isRequired } from "../required/validator"
import { AdditionalProperties, TypeOf } from "../functional"
import { AnyValidator } from "../any/validator"


export class ObjectValidator< T extends { } >
	extends ValueValidator< T, ObjectValidator< T > >
{
	protected type: Type = "object";
	private _properties: { [ key: string ]: BaseValidator< unknown > };
	private _additional: BaseValidator< unknown > | boolean | undefined =
		undefined;

	constructor( properties: { [ key: string ]: BaseValidator< unknown > } )
	{
		super( );

		this._properties = properties;
	}

	protected chainedAdditional( ): BaseValidator< unknown > | boolean
	{
		return this._additional
			?? this._parent?.chainedAdditional( )
			?? new AnyValidator( );
	}

	public const< V extends T >( value: V ): ObjectValidator< V >
	{
		return super.const( value ) as unknown as ObjectValidator< V >;
	}

	public enum< V extends T >(
		...values: ( keyof V extends keyof T ? V[ ] : T[ ] )
	) : ObjectValidator< typeof values[ number ] >
	{
		return super.enum( ...values ) as any;
	}

	/**
	 * ## How to handle additional properties not individually specified.
	 *
	 * ### This can be set to:
	 *   * **`true`**: Any additional properties are allowed *(default)*
	 *   * **`false`**: No additional properties are allowed
	 *   * **a sub-validator**: Additional properties are allowed of a certain
	 * 	   type
	 */
	public additional( type: false ): this;
	public additional( type: true )
	: ObjectValidator< AdditionalProperties< T, unknown > >;
	public additional< U extends BaseValidator< unknown > >( type: U )
	: ObjectValidator< AdditionalProperties< T, TypeOf< U > > >;
	public additional( type: boolean | BaseValidator< unknown > )
	: any
	{
		const clone = this.clone( );
		clone._additional =
			type === true
			? true
			: type === false
			? false
			: type;
		return clone;
	}

	protected toSchema( traverser: TreeTraverser )
	{
		const keys = Object.keys( this._properties );
		const properties: any = { };
		const required: Array< string > = [ ];
		keys.forEach( key =>
		{
			properties[ key ] = traverser.visit( this._properties[ key ] );
			if ( isRequired( this._properties[ key ] ) )
				required.push( key );
		} );

		const additional = this.chainedAdditional( );

		return {
			type: "object",
			...this.getJsonSchemaObject( traverser ),
			...(
				keys.length > 0
				? { properties }
				: { }
			),
			...( required.length === 0 ? { } : { required } ),
			...(
				additional === true
				? { additionalProperties: true }
				: additional === false
				? { additionalProperties: false }
				: validatorType( additional ) === "any"
				? { }
				: { additionalProperties: traverser.visit( additional ) }
			),
		};
	}

	protected clone( clean: boolean = false )
	{
		return this.setupClone(
			clean,
			new ObjectValidator< T >( this._properties )
		);
	}
}
