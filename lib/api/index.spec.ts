import { suretype, annotate, v, ensureNamed } from './index'
import { compile } from '..'
import { getName } from '../annotations'


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

describe( "annotate", ( ) =>
{
	it( "should validate a annotate()'d schema", ( ) =>
	{
		const inner = v.object( {
			foo: v.string( ).const( "bar" ),
			bar: v.number( ).gt( 17 ).required( ),
		} );
		const schema = annotate(
			{
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

describe( "ensureNamed", ( ) =>
{
	it( "should not change name of annotated validator", ( ) =>
	{
		const schema = suretype(
			{ name: 'Goodname' },
			v.object( { foo: v.string( ) } )
		);
		const validator = ensureNamed( 'Badname', schema );
		expect( getName( validator ) ).toBe( 'Goodname' );
	} );

	it( "should change name of non-annotated validator", ( ) =>
	{
		const schema = v.object( { foo: v.string( ) } );
		const validator = ensureNamed( 'Goodname', schema );
		expect( getName( validator ) ).toBe( 'Goodname' );
	} );
} );
