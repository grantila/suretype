import type {
	ExportRefMethod,
	OnTopLevelNameConflict,
	OnNonSuretypeValidator,
} from "./types"
import { DuplicateError } from "./errors"
import { CoreValidator } from "./validators/core/validator"
import { getName, getNames } from "./annotations"
import { TreeTraverserImpl } from "./tree-traverser"
import { isRaw } from "./validators/raw/validator"
import { uniqValidators } from "./validation"


export interface ExtractJsonSchemaOptions
{
	refMethod?: ExportRefMethod;
	onTopLevelNameConflict?: OnTopLevelNameConflict;
	onNonSuretypeValidator?: OnNonSuretypeValidator;
}

export interface SchemaWithDefinitions
{
	definitions: { [ name: string ]: any; };
}

/**
 * Get the JSON schema (as a JavaScript object) for an array of schema
 * validators.
 *
 * @param validators The validators to get the JSON schema from.
 */
export function extractJsonSchema(
	validators: Array< CoreValidator< unknown > >,
	{
		refMethod = 'ref-all',
		onTopLevelNameConflict = 'error',
		onNonSuretypeValidator = 'error',
	}: ExtractJsonSchemaOptions = { }
)
: { schema: SchemaWithDefinitions }
{
	if ( onNonSuretypeValidator === 'ignore' )
	{
		validators = validators.filter( validator => getName( validator ) );
	}
	else if ( onNonSuretypeValidator === 'error' )
	{
		validators.forEach( validator =>
		{
			if ( !getName( validator ) )
				throw new TypeError( "Got unnamed validator" );
		} );
	}

	validators = uniqValidators( validators );

	if ( onTopLevelNameConflict === 'error' )
	{
		const nameSet = new Set< string >( );
		validators
		.map( validator => getNames( validator ) )
		.filter( v => v.length > 0 )
		.forEach( names =>
		{
			for ( const name of names )
			{
				if ( nameSet.has( name ) )
					throw new DuplicateError(
						`Duplicate validators found with name "${name}"`
					);
				nameSet.add( name );
			}
		} );
	}

	const traverser = new TreeTraverserImpl( validators, refMethod );
	const { schema } = traverser.getSchema( );

	return { schema };
}

export type ExtractSingleSchemaResult =
	{ schema: Record< string, any >; fragment?: undefined; }
	|
	{ schema: SchemaWithDefinitions; fragment: string; }

/**
 * Get the JSON schema (as a JavaScript object) for a single schema validator.
 *
 * @param validator The validator to get the JSON schema from.
 * @returns { schema, fragment } where either schema is a single schema and
 *          fragment is undefined, or schema is a definition schema (with
 *          multiple fragments) and fragment specifies the specific fragment.
 */
export function extractSingleJsonSchema( validator: CoreValidator< unknown > )
: ExtractSingleSchemaResult
{
	if ( isRaw( validator ) )
		return { schema: validator.toSchema( ), fragment: validator.fragment };

	const { schema: { definitions } } =
		extractJsonSchema(
			[ validator ],
			{
				refMethod: 'no-refs',
				onNonSuretypeValidator: 'create-name',
				onTopLevelNameConflict: 'rename',
			}
		);
	return { schema: Object.values( definitions )[ 0 ] };
}
