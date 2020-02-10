
export class DuplicateError extends Error
{ }

export class DuplicateConstraintError extends DuplicateError
{
	constructor( field: string )
	{
		super( `Constraint ${field} already set.` );
	}
}
