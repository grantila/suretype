import * as assert from "assert"
import * as Benchmark from "benchmark"
import * as Joi from "@hapi/joi"
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

function runBenchmark( )
{
	suite.add( "Joi", ( ) =>
	{
		joiValidator.validate( makeValue( ) );
	} );

	suite.add( "suretype", ( ) =>
	{
		suretypeValidator( makeValue( ) );
	} );

	suite.on( "cycle", ( event: any ) =>
	{
		console.log( event.target.toString( ) );
	} );

	suite.run( { async: true } );
}

ensureCorrect( );
runBenchmark( );
