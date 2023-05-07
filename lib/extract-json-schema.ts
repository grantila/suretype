import type {
	ExportRefMethod,
	OnTopLevelNameConflict,
	OnNonSuretypeValidator,
} from "./types.js"
import { DuplicateError } from "./errors.js"
import { CoreValidator } from "./validators/core/validator.js"
import { getName, getNames } from "./annotations.js"
import { TreeTraverserImpl } from "./tree-traverser.js"
import { getRaw } from "./validators/raw/validator.js"
import { uniqValidators } from "./validation.js"


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

export interface ExtractedJsonSchema
{
	/**
	 * The extracted schema definitions
	 */
	schema: SchemaWithDefinitions;

	/**
	 * Lookup from validator to schema object
	 */
	lookup: Map< CoreValidator< unknown >, any >;

	/**
	 * Lookup from top-level schema object to its corresponding name.
	 * This is its referrable name, which might not be the same as its inner
	 * name if it had to be renamed due to top-level naming conflicts.
	 */
	schemaRefName: Map< any, string >;
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
: ExtractedJsonSchema
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

	const traverser = new TreeTraverserImpl(
		validators,
		refMethod,
		onNonSuretypeValidator === 'lookup'
	);
	const { schema, lookup } = traverser.getSchema( );

	const schemaRefName = new Map< any, string >( );
	Object
		.entries( ( schema as SchemaWithDefinitions ).definitions )
		.forEach( ( [ name, schema ] ) =>
		{
			schemaRefName.set( schema, name );
		} );

	return { schema, lookup, schemaRefName };
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
	const raw = getRaw( validator );
	if ( raw )
		return { schema: raw.toSchema( ), fragment: raw.fragment };

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
