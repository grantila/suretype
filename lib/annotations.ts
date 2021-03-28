import { BaseValidator } from "./validators/base/validator"

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

type AnnotatedValidator< T extends BaseValidator< unknown, any > > =
	T & { _annotations: AnnotationsHolder };

export function annotateValidator< T extends BaseValidator< unknown > >(
	validator: T,
	annotations: AnnotationsHolder
): T
{
	( validator as AnnotatedValidator< T > )._annotations = annotations;
	return validator;
}

export function getAnnotations< T extends BaseValidator< unknown > >(
	validator: T
): Annotations | undefined
{
	return ( validator as AnnotatedValidator< T > )._annotations?.options;
}
