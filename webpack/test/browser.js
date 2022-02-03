import { fileURLToPath } from 'node:url'
import path from 'node:path'

import puppeteer from 'puppeteer'

const __dirname = path.dirname( fileURLToPath( import.meta.url ) );
const pagePath =
	path.normalize( path.resolve( __dirname, '../dist/index.html' ) );


const expectedText =
	'The .type value cannot be "normal", did you mean "big" or "small"?';

const expectedStyled = `
  1 | {
  2 |   "title": "foo",
> 3 |   "type": "normal",
    |           ^^^^^^^^ replace this with an allowed value
  4 |   "extra": 42
  5 | }`;

const expectSame = ( testName, got, expected ) =>
{
	if ( got.trim( ) !== expected )
	{
		console.error( `Test "${testName}" failed!` );
		console.error( `text = [${got}]` );
		console.error( `expected = [${expected}]` );
		throw new Error( 'webpack test failed' );
	}
};

( async ( ) =>
{
	const browser = await puppeteer.launch( );
	const page = await browser.newPage( );

	const consoleLogs = [ ];
	page.on(
		'console',
		msg =>
			{
				if ( msg.type( ) === 'log' )
					consoleLogs.push( msg.text( ) );
			}
	);

	await page.goto( `file://${pagePath}` );

	await new Promise( resolve => setTimeout( resolve, 2000 ) );

	const text1 = await page.$eval( '#div1', page => page.innerHTML );
	const text2 = await page.$eval( '#div2', page => page.innerHTML );

	await browser.close( );

	const shouldHandleStyles =
		between( consoleLogs, 'START HANDLE STYLES', 'END HANDLE STYLES' )
		.join( '' ) === 'true';

	const combined =
		shouldHandleStyles
		? `${expectedText}\n${expectedStyled}`
		: `${expectedText}`;

	expectSame(
		'html ensured',
		text1.trim( ),
		`Result:\n${htmlify(combined)}`
	);
	expectSame(
		'html validated',
		text2.trim( ),
		`Result:\n${htmlify(combined)}`
	);

	const ensure = between( consoleLogs, 'START ensure', 'END ensure' );
	const validate = between( consoleLogs, 'START validate', 'END validate' );

	expectSame( 'console ensured', ensure.join( '' ), combined );
	expectSame( 'console validated', validate.join( '' ), combined );
} )( );

function between( arr, start, end )
{
	return arr.slice(
		arr.findIndex( text => text === start ) + 1,
		arr.findIndex( text => text === end )
	);
}

function htmlify( text )
{
	return text.replace( />/g, '&gt;' );
}
