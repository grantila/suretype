import * as assert from "assert"
import * as Benchmark from "benchmark"
import * as Joi from "@hapi/joi"
import * as ss from 'superstruct'
import * as z from 'zod'
import ow from 'ow'

import { v, compile } from "../"
import { TypeOf } from "../dist/validators/functional"


const joiSchema =
	Joi.object( {
		id: Joi.number( ).required( ),
		level: Joi.string( ).valid( "debug", "info", "notice" ).required( ),
		bool: Joi.boolean( ),
		nul: Joi.any( ).valid( null ),
		arr: Joi.array( ).items( Joi.string( ), Joi.number( ) ),
		sub: Joi.object( {
			x: Joi.any( ),
			tup: Joi.array( ).ordered(
				Joi.boolean( ).required( ),
				Joi.number( ).required( )
			).required( ),
		} ),
	} )
	.unknown( true );

const superstructSchema =
	ss.type( {
		id: ss.number( ),
		level: ss.enums( [ "debug", "info", "notice" ] ),
		bool: ss.optional( ss.boolean( ) ),
		nul: ss.literal( null ),
		arr: ss.array( ss.union( [ ss.string( ), ss.number( ) ] ) ),
		sub: ss.optional( ss.object( {
			x: ss.optional( ss.any( ) ),
			tup: ss.tuple( [ ss.boolean( ), ss.number( ) ] ),
		} ) ),
	} );

const zodSchema =
	z.object( {
		id: z.number( ),
		level: z.union( [
			z.literal( "debug" ),
			z.literal( "info" ),
			z.literal( "notice" )
		] ),
		bool: z.boolean( ).optional( ),
		nul: z.null( ),
		arr: z.array( z.union( [ z.string( ), z.number( ) ] ) ),
		sub: z.object( {
			x: z.any( ).optional( ),
			tup: z.tuple( [ z.boolean( ), z.number( ) ] ),
		} ).optional( ),
	} );

const owSchema =
	ow.object.partialShape( {
		id: ow.number,
		level: ow.string.oneOf( [ "debug", "info", "notice" ] ),
		bool: ow.optional.boolean,
		nul: ow.optional.null,
		arr: ow.optional.array.ofType(ow.any(ow.string, ow.number)),
		sub: ow.optional.object.partialShape( {
			x: ow.optional.any( ),
			tup: ow.array.exactShape( [ ow.boolean, ow.number ] ),
		} ),
	} );

const suretypeSchema =
	v.object( {
		id: v.number( ).required( ),
		level: v.string( ).enum( "debug", "info", "notice" ).required( ),
		bool: v.boolean( ),
		nul: v.null( ),
		arr: v.array( v.anyOf( [ v.string( ), v.number( ) ] ) ),
		sub: v.object( {
			x: v.any( ),
			tup: v.array( [ v.boolean( ), v.number( ) ] ).required( ),
		} ),
	} )
	.additional( true );

const makeValue = ( ): TypeOf< typeof suretypeSchema> =>
	( {
		id: Math.random( ),
		level: "info",
		nul: null,
		arr: [ "foo", 42, "bar" ],
		sub: {
			x: "foo",
			tup: [ true, 4711 ],
		},
	} );

const joiValidator = Joi.compile( joiSchema );
const ssValidator = ( val: any ) => ss.assert( val, superstructSchema );
const zValidator = ( val: any ) => zodSchema.parse( val );
const owValidator = ( val: any ) => ow( val, owSchema );
const suretypeValidator = compile( suretypeSchema );

const suite = new Benchmark.Suite( );

function ensureCorrect( )
{
	const testValue = makeValue( );
	assert(
		JSON.stringify( joiValidator.validate( testValue ).value )
		=== JSON.stringify( testValue )
	);
	assert( suretypeValidator( testValue ).ok === true );
}

const fasterThan: Array< { name: string; ops: number; } > = [ ];
let sureTypeOps = 0;

function runBenchmark( )
{
	suite.add( "Joi", ( ) =>
	{
		joiValidator.validate( makeValue( ) );
	} );

	suite.add( "Superstruct", ( ) =>
	{
		ssValidator( makeValue( ) );
	} );

	suite.add( "Zod", ( ) =>
	{
		zValidator( makeValue( ) );
	} );

	suite.add( "ow", ( ) =>
	{
		owValidator( makeValue( ) );
	} );

	suite.add( "SureType", ( ) =>
	{
		suretypeValidator( makeValue( ) );
	} );

	suite.on( "cycle", ( event: any ) =>
	{
		if ( event.target.name !== "SureType" )
			fasterThan.push( {
				name: event.target.name,
				ops: event.target.hz,
			} );
		else
			sureTypeOps = event.target.hz;
		console.log( event.target.toString( ) );
	} );

	suite.on( "complete", ( ) =>
	{
		console.log( '-----' );
		fasterThan.forEach( ( { name, ops } ) =>
		{
			const times = Math.round( sureTypeOps / ops );
			console.log( `${times}x faster than ${name}` );
		} );
	} );

	suite.run( { async: true } );
}

ensureCorrect( );
runBenchmark( );
