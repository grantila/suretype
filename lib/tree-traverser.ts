import { TreeTraverser, BaseValidator } from "./validators/base/validator"
import type { ExportRefMethod } from "./types"
import { validatorToSchema } from "./validation"
import { getAnnotations } from "./annotations"


export class TreeTraverserImpl implements TreeTraverser
{
	private initialValidators =
		new Map< BaseValidator< unknown, any >, string >( );
	private extraValidators =
		new Map< BaseValidator< unknown, any >, string >( );
	private validatorNames = new Set< string >( );
	private definitions: { [ name: string ]: any; } = { };
	private duplicates = new Map< string, number >( );

	public currentSchemaName: string | undefined = undefined;

	public constructor(
		initialValidators: Array< BaseValidator< unknown, any > >,
		private refMethod: ExportRefMethod
	)
	{
		initialValidators
		.map( validator => this.makeRef( validator, false ) )
		.forEach( nameAndValidator => { this.insert( nameAndValidator ); } );
	}

	public visit( validator: BaseValidator< unknown, any > ): any
	{
		const name = this.getValidatorName( validator );
		if ( !name )
			return validatorToSchema( validator, this );
		return { $ref: `#/definitions/${name}` };
	}

	public getSchema( )
	: { schema: any; duplicates: Map< string, number >; }
	{
		return {
			schema: {
				definitions: this.definitions,
			},
			duplicates: this.duplicates,
		};
	}

	private getValidatorName( validator: BaseValidator< unknown, any > )
	{
		if ( this.refMethod === 'no-refs' )
			return undefined;

		const decorations = getAnnotations( validator );
		if ( !decorations?.name )
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
			{ name: string; validator: BaseValidator< unknown, any >; }
	)
	{
		this.currentSchemaName = name;
		this.definitions[ name ] = validatorToSchema( validator, this );
		this.currentSchemaName = undefined;
		return name;
	}

	private makeRef( validator: BaseValidator< unknown, any >, extra: boolean )
	{
		const decorations = getAnnotations( validator );

		const name = this.getNextName( decorations?.name );

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
		while ( ++i )
		{
			const name = iterationName + `_${i}`;
			if ( !this.validatorNames.has( name ) )
			{
				this.validatorNames.add( name );
				return name;
			}
		}
		return 'x'; // TS-dummy
	}
}
