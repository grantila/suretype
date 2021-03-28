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
		sub: Joi.object( { x: Joi.any( ) } ),
	} )
	.unknown( true );

const superstructSchema =
	ss.type( {
		id: ss.number( ),
		level: ss.enums( [ "debug", "info", "notice" ] ),
		bool: ss.optional( ss.boolean( ) ),
		sub: ss.optional( ss.object( { x: ss.any( ) } ) ),
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
		sub: z.object( { x: z.any( ) } ).optional( ),
	} );

const owSchema =
	ow.object.partialShape( {
		id: ow.number,
		level: ow.string.oneOf( [ "debug", "info", "notice" ] ),
		bool: ow.optional.boolean,
		sub: ow.optional.object.partialShape( { x: ow.any( ) } ),
	} );

const suretypeSchema =
	v.object( {
		id: v.number( ).required( ),
		level: v.string( ).enum( "debug", "info", "notice" ).required( ),
		bool: v.boolean( ),
		sub: v.object( { x: v.any( ) } ),
	} )
	.additional( true );

const makeValue = ( ): TypeOf< typeof suretypeSchema> =>
	( { id: Math.random( ), level: "info", sub: { x: "foo" } } );

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
