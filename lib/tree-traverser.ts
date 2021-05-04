import { TreeTraverser, CoreValidator } from "./validators/core/validator"
import type { ExportRefMethod } from "./types"
import { validatorToSchema } from "./validation"
import { getName } from "./annotations"
import { isRaw } from "./validators/raw/validator"


export interface SchemaResult
{
	schema: any;
	duplicates: Map< string, number >;
	lookup: Map< CoreValidator< unknown >, any >;
}

export class TreeTraverserImpl implements TreeTraverser
{
	private initialValidators =
		new Map< CoreValidator< unknown >, string >( );
	private extraValidators =
		new Map< CoreValidator< unknown >, string >( );
	private validatorNames = new Set< string >( );
	private definitions: { [ name: string ]: any; } = { };
	private lookupMap = new Map< CoreValidator< unknown >, any >( );
	private duplicates = new Map< string, number >( );

	public currentSchemaName: string | undefined = undefined;

	public constructor(
		validators: Array< CoreValidator< unknown > >,
		private refMethod: ExportRefMethod,
		private allowUnnamed: boolean
	)
	{
		const rawValidators = validators.filter( isRaw );
		const regularValidators =
			validators.filter( validator => !isRaw( validator ) );

		rawValidators
		.forEach( validator =>
		{
			const schema = validator.toSchema( );
			if ( typeof schema.definitions === 'object' )
			{
				Object
				.entries( schema.definitions )
				.forEach( ( [ fragment, subSchema ] ) =>
				{
					const name = this.getNextName( fragment );
					this.definitions[ name ] = subSchema;
				} );
			}
			else
			{
				this.lookupMap.set( validator, schema );

				const name = this.getNextName( getName( validator ) );
				if ( name )
					this.definitions[ name ] = schema;
				else if ( !allowUnnamed )
					throw new TypeError( "Got unnamed validator" );
			}
		} );

		regularValidators
		.map( validator => this.makeRef( validator, false ) )
		.forEach( nameAndValidator => { this.insert( nameAndValidator ); } );
	}

	public visit( validator: CoreValidator< unknown > ): any
	{
		const name = this.getValidatorName( validator );
		if ( !name )
			return validatorToSchema( validator, this );
		return { $ref: `#/definitions/${name}` };
	}

	public getSchema( ): SchemaResult
	{
		return {
			schema: {
				definitions: this.definitions,
			},
			duplicates: this.duplicates,
			lookup: this.lookupMap,
		};
	}

	private getValidatorName( validator: CoreValidator< unknown > )
	{
		if ( this.refMethod === 'no-refs' )
			return undefined;

		const name = getName( validator );
		if ( !name )
			return undefined;

		const nameIfInitial = this.initialValidators.get( validator );
		if ( nameIfInitial )
			return nameIfInitial;

		if ( this.refMethod === 'provided' )
			return undefined;

		const nameIfExtra = this.extraValidators.get( validator );
		if ( nameIfExtra )
			return nameIfExtra;

		// Instanciate new extra validator definition
		return this.insert( this.makeRef( validator, true ) );
	}

	private insert(
		{ name, validator }:
			{ name?: string; validator: CoreValidator< unknown >; }
	)
	{
		if ( name )
			this.currentSchemaName = name;

		const schema = validatorToSchema( validator, this );
		this.lookupMap.set( validator, schema );
		if ( name )
			this.definitions[ name ] = schema;

		this.currentSchemaName = undefined;

		return name;
	}

	private makeRef( validator: CoreValidator< unknown >, extra: boolean )
	{
		const baseName = getName( validator );

		if ( !baseName && !extra && this.allowUnnamed )
			return { validator };

		const name = this.getNextName( baseName );

		if ( extra )
			this.extraValidators.set( validator, name );
		else
			this.initialValidators.set( validator, name );

		return { name, validator };
	}

	private getNextName( baseName: string | undefined ): string
	{
		if ( baseName && !this.validatorNames.has( baseName ) )
		{
			this.validatorNames.add( baseName );
			return baseName;
		}

		if ( baseName )
			this.duplicates.set(
				baseName,
				1 + ( this.duplicates.get( baseName ) ?? 1 )
			);

		const iterationName = baseName ?? 'Unknown';

		let i = baseName ? 1 : 0;
		while ( true )
		{
			const name = iterationName + `_${++i}`;
			if ( !this.validatorNames.has( name ) )
			{
				this.validatorNames.add( name );
				return name;
			}
		}
	}
}
