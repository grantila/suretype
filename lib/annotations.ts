import {
	CoreValidator,
	exposeCoreValidator,
} from "./validators/core/validator"
import { isRaw } from "./validators/raw/validator"


export interface Annotations
{
	name?: string;
	title?: string;
	description?: string;
	examples?: Array< string >;
}

export type TopLevelAnnotations =
	Omit< Annotations, 'name' > &
	Required< Pick< Annotations, 'name' > >;

export class AnnotationsHolder
{
	constructor( public options: Annotations )
	{ }
}

export function annotateValidator< T extends CoreValidator< unknown > >(
	validator: T,
	annotations: AnnotationsHolder
): T
{
	exposeCoreValidator( validator )._annotations = annotations;
	return validator;
}

export function getAnnotations< T extends CoreValidator< unknown > >(
	validator: T
): Annotations | undefined
{
	const annotations = exposeCoreValidator( validator )._annotations?.options;

	if ( isRaw( validator ) && validator.fragment )
	{
		if ( !annotations?.name )
			return { ...annotations, name: validator.fragment };
	}

	return annotations;
}

export function getName< T extends CoreValidator< unknown > >( validator: T )
: string | undefined
{
	const name = exposeCoreValidator( validator )._annotations?.options?.name;

	if ( !name && isRaw( validator ) && validator.fragment )
	{
		return validator.fragment;
	}

	return name;
}

export function getNames< T extends CoreValidator< unknown > >( validator: T )
: Array< string >
{
	const name = exposeCoreValidator( validator )._annotations?.options?.name;

	const otherNames = isRaw( validator ) && validator.fragment
		? Object.keys( validator.toSchema( ).definitions )
		: [ ];

	return name ? [ ...new Set( [ name, ...otherNames ] ) ] : otherNames;
}
