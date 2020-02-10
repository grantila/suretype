import { suretype, v } from './index'
import { compile } from '..'


describe( "suretype", ( ) =>
{
	it( "should validate a suretype()-decorated schema", ( ) =>
	{
		const inner = v.object( {
			foo: v.string( ).const( "bar" ),
			bar: v.number( ).gt( 17 ).required( ),
		} );
		const schema = suretype(
			{
				name: "Foo",
				description: "Description",
				title: "Title",
				examples: [ "Example" ],
			},
			inner
		);

		const innerValidator = compile( inner );
		const outerValidator = compile( schema );

		const valid = { bar: 20 };
		const invalid = { foo: 30, bar: 20 };

		expect( innerValidator( valid ).ok ).toBe( true );
		expect( innerValidator( invalid ).ok ).toBe( false );
		expect( outerValidator( valid ).ok ).toBe( true );
		expect( outerValidator( invalid ).ok ).toBe( false );
	} );
} );

describe( "v", ( ) =>
{
	it( "should compile and validate a validator schema", ( ) =>
	{
		const schema = v.object( { foo: v.string( ) } );

		const validator = compile( schema );

		expect( validator( { foo: "foo" } ).ok ).toBe( true );
		expect( validator( { foo: 42 } ).ok ).toBe( false );
	} );
} );
