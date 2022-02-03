import { type prettify } from "awesome-ajv-errors"

let _prettify: typeof prettify;

export function setPrettify( instance: typeof prettify )
{
	_prettify = instance;
}

export function getPrettify( ): typeof prettify
{
	return _prettify;
}
