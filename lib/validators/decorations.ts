
export interface Decorations
{
	name: string;
	title?: string;
	description?: string;
	examples?: Array< string >;
}

export class DecorationsHolder
{
	constructor( public options: Decorations )
	{ }
}
