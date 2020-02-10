import {
	extractJsonSchema,
	extractSingleJsonSchema,
} from './extract-json-schema'
import { suretype, v } from './api/index'
import { ExportRefMethod } from './types'


describe( "extract-json-schema", ( ) =>
{
	it( "suretype() should keep validator schema", ( ) =>
	{
		const schema = v.object( {
			foo: v.string( ).const( "bar" ),
			bar: v.number( ).gt( 17 ).required( ),
		} );
		const schema2 = suretype( { name: "Foo" }, schema );

		expect(
			extractSingleJsonSchema( schema )
		).toStrictEqual(
			extractSingleJsonSchema( schema2 )
		);
		expect( schema.constructor ).toEqual( schema2.constructor );
	} );

	it( "suretype() of an array should produce valid JSON schema", ( ) =>
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

		const jsonSchemaInner = extractSingleJsonSchema( inner );
		const { schema: jsonSchemaOuter } = extractJsonSchema( [ schema ] );

		expect( jsonSchemaOuter ).toEqual( {
			definitions: {
				Foo: {
					description: "Description",
					title: "Title",
					examples: [ "Example" ],
					...jsonSchemaInner,
				}
			}
		} );
	} );

	it( "should produce valid JSON schema for a 2+sized array", ( ) =>
	{
		const inner1 = v.object( { foo: v.string( ).const( "bar" ) } );
		const inner2 = v.object( { bar: v.number( ).gt( 17 ).required( ) } );
		const schema1 = suretype(
			{
				name: "Foo",
				description: "Description",
				title: "Title",
				examples: [ "Example" ],
			},
			inner1
		);
		const schema2 = suretype(
			{
				name: "Bar",
				description: "Desc",
				title: "T",
				examples: [ "Ex" ],
			},
			inner2
		);

		const jsonSchemaInner1 = extractSingleJsonSchema( inner1 );
		const jsonSchemaInner2 = extractSingleJsonSchema( inner2 );
		const { schema: jsonSchemaOuter } =
			extractJsonSchema( [ schema1, schema2 ] );

		expect( jsonSchemaOuter ).toEqual( {
			definitions: {
				Foo: {
					description: "Description",
					title: "Title",
					examples: [ "Example" ],
					...jsonSchemaInner1,
				},
				Bar: {
					description: "Desc",
					title: "T",
					examples: [ "Ex" ],
					...jsonSchemaInner2,
				},
			}
		} );
	} );

	it( "should fail on non-decorated top-level validator schemas", ( ) =>
	{
		const schema1 = suretype(
			{ name: "Foo" },
			v.number( )
		);
		const schema2 = v.string( );

		expect( ( ) => extractJsonSchema( [ schema1, schema2 ] ) )
			.toThrowError( /undecorated/ );
	} );

	it( "should ignore non-decorated validator schemas", ( ) =>
	{
		const schema1 = suretype(
			{ name: "Foo" },
			v.number( )
		);
		const schema2 = v.string( );

		const { schema } = extractJsonSchema(
			[ schema1, schema2 ],
			{ onNonSuretypeValidator: 'ignore' }
		);

		expect( schema ).toMatchSnapshot( );
	} );

	it( "should call non-decorated validator schemas 'Unknown'", ( ) =>
	{
		const schema1 = suretype(
			{ name: "Foo" },
			v.number( )
		);
		const schema2 = v.string( );

		const { schema } = extractJsonSchema(
			[ schema1, schema2 ],
			{ onNonSuretypeValidator: 'create-name' }
		);

		expect( schema ).toMatchSnapshot( );
	} );

	it( "should fail on duplicate top-level names", ( ) =>
	{
		const schema1 = suretype(
			{ name: "Foo" },
			v.number( )
		);
		const schema2 = suretype(
			{ name: "Foo" },
			v.string( )
		);

		expect( ( ) => extractJsonSchema( [ schema1, schema2 ] ) )
			.toThrow( /uplicate.*Foo/ );
	} );

	it( "should be able to rename top-level names", ( ) =>
	{
		const schema1 = suretype(
			{ name: "Foo" },
			v.number( )
		);
		const schema2 = suretype(
			{ name: "Foo" },
			v.string( )
		);

		const { schema } = extractJsonSchema(
			[ schema1, schema2 ],
			{ onTopLevelNameConflict: 'rename' }
		);

		expect( schema ).toMatchSnapshot( );
	} );

	it( "should produce two (referenced) definitions for 2 schemas", ( ) =>
	{
		const schema1 = suretype(
			{
				name: "Foo",
				description: "Description",
				title: "Title",
				examples: [ "Example" ],
			},
			v.object( { foo: v.string( ).const( "bar" ) } )
		);
		const schema2 = suretype(
			{
				name: "Bar",
				description: "Desc",
				title: "T",
				examples: [ "Ex" ],
			},
			v.object( {
				bar: v.number( ).gt( 17 ).required( ),
				foo: schema1,
			} )
		);

		const { schema: jsonSchemaOuter } =
			extractJsonSchema( [ schema1, schema2 ] );

		expect( jsonSchemaOuter ).toMatchSnapshot( );
	} );

	const methods: Array< ExportRefMethod > =
		[ 'no-refs', 'provided', 'ref-all' ];

	for ( const refMethod of methods )
	{
		it(
			"should produce proper definitions for referenced schemas " +
			`(using method ${refMethod})`,
			( ) =>
		{
			const inlined = suretype(
				{
					name: 'Baz'
				},
				v.number( )
			);
			const schema1 = suretype(
				{
					name: "Foo",
					description: "Description",
					title: "Title",
					examples: [ "Example" ],
				},
				v.object( { foo: v.string( ).const( "bar" ) } )
			);
			const schema2 = suretype(
				{
					name: "Bar",
					description: "Desc",
					title: "T",
					examples: [ "Ex" ],
				},
				v.object( {
					bar: v.number( ).gt( 17 ).required( ),
					foo: schema1,
					baz: inlined,
					bak: inlined,
				} )
			);

			const { schema: jsonSchemaOuter } =
				extractJsonSchema( [ schema1, schema2 ], { refMethod } );

			expect( jsonSchemaOuter ).toMatchSnapshot( );
		} )
	}
} );
