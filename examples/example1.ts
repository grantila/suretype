import { v, suretype, compile, TypeOf } from "../lib/index-core"

const userSchema = suretype(
	{
		name: 'User',
		description: 'A user representation',
	},
	v.object( {
		firstName: v.string( ).minLength( 1 ),
		lastName: v.string( ).minLength( 1 ),
		id: v.string( ),
		email: v.string( ).format( 'email' ).optional( ),
	} )
);

const messageSchema = suretype(
	{
		name: 'Message',
		description: 'A message from a user, to a user',
	},
	v.object( {
		body: v.string( ),
		from: userSchema.optional( ),
		to: userSchema.optional( ),
		sentAt: v.string( ).format( 'date-time' ).optional( ),
	} )
);


// Either use this type throughout the application, or export a prettier type
// using typeconv.
export type User = TypeOf< typeof userSchema >;
export type Message = TypeOf< typeof messageSchema >;

export const ensureUser = compile( userSchema, { ensure: true } );
export const ensureMessage = compile( messageSchema, { ensure: true } );
