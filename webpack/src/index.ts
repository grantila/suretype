import { v, compile } from 'suretype'


const div1 = document.createElement( 'div' );
div1.id = 'div1';
const div2 = document.createElement( 'div' );
div2.id = 'div2';
const div3 = document.createElement( 'div' );
div3.id = 'div3';

document.documentElement.appendChild( div1 );
document.documentElement.appendChild( div2 );
document.documentElement.appendChild( div3 );


const schemaThing = v.object( {
	title: v.string( ).required( ),
	type: v.string( ).enum( 'big', 'small' ).required( ),
} );

const styling = { color: true, location: true };
const ensureThing = compile( schemaThing, { ensure: true, ...styling } );
const validateThing = compile( schemaThing, { ...styling } );

const data = {
	title: 'foo',
	type: 'normal',
	extra: 42,
};

console.log( 'START HANDLE STYLES' );
console.log( !!process.env.shouldHandleStyles );
console.log( 'END HANDLE STYLES' );

function makeHTML( text: string ): string
{
	return text
		.split( "\n" )
		.map( line => line.replace( / /g, String.fromCharCode( 160 ) ) )
		.join( "<br />\n" );
}

async function printResult( )
{
	await new Promise( resolve => setTimeout( resolve, 1000 ) );

	try
	{
		ensureThing( data );
	}
	catch ( err )
	{
		div1.innerHTML = `Result:\n${err.explanation}`;
		console.log( 'START ensure' );
		console.log( err.explanation );
		console.log( 'END ensure' );
	}

	const result =  validateThing( data );

	console.log( 'START validate' );
	console.log( result.explanation );
	console.log( 'END validate' );

	div2.innerHTML = `Result:\n${result.explanation}`;

	// For manual inspection
	div3.innerHTML = makeHTML( `Result:\n${result.explanation}` );
}

printResult( );
