
export type Type =
	| "string"
	| "number"
	| "integer"
	| "object"
	| "array"
	| "boolean"
	| "null";

export type AnyType =
	| Type
	| "any"
	| "any-of"
	| "all-of"
	| "if"
	| "recursive";

export type FilterProperties< T, Cond > =
	{
		[ K in keyof T ]: T[ K ] extends Cond ? K : never
	};

export type FilterNames< T, Cond > = FilterProperties< T, Cond >[ keyof T ];

export type SubType< T, Cond, Invert = false > =
	Invert extends true
	? Omit< T, FilterNames< T, Cond > >
	: Pick< T, FilterNames< T, Cond > >;

export abstract class RecursiveValue { }
