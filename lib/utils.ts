
const empty = { };

export function objectOf< T, K extends string >( value: T | undefined, key: K )
: { [ P in K ]: NonNullable< T > } | { }
{
	if ( value === undefined )
		return empty;
	return { [ key ]: value };
}
