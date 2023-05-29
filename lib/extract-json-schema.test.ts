import {
	extractJsonSchema,
	extractSingleJsonSchema,
} from "./extract-json-schema.js"
import { suretype, v } from "./api/index.js"
import { ExportRefMethod } from "./types.js"


describe( "extract-json-schema", ( ) =>
{
	it( "suretype() should keep validator schema", ( ) =>
	{
		const schema = v.object( {
			foo: v.string( ).const( "bar" ).optional( ),
			bar: v.number( ).gt( 17 ),
		} );
		const schema2 = suretype( { name: "Foo" }, schema );

		expect(
			extractSingleJsonSchema( schema ).schema
		).toStrictEqual(
			extractSingleJsonSchema( schema2 ).schema
		);
		expect( schema.constructor ).toEqual( schema2.constructor );
	} );

	it( "suretype() of an array should produce valid JSON schema", ( ) =>
	{
		const inner = v.object( {
			foo: v.string( ).const( "bar" ).optional( ),
			bar: v.number( ).gt( 17 ),
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

		const { schema: jsonSchemaInner } = extractSingleJsonSchema( inner );
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
		const inner1 = v.object( {
			foo: v.string( ).const( "bar" ).optional( ),
		} );
		const inner2 = v.object( {
			bar: v.number( ).gt( 17 ),
		} );
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

		const { schema: jsonSchemaInner1 } = extractSingleJsonSchema( inner1 );
		const { schema: jsonSchemaInner2 } = extractSingleJsonSchema( inner2 );
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
			.toThrowError( /unnamed/ );
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
			v.object( { foo: v.string( ).const( "bar" ).optional( ) } )
		);
		const schema2 = suretype(
			{
				name: "Bar",
				description: "Desc",
				title: "T",
				examples: [ "Ex" ],
			},
			v.object( {
				bar: v.number( ).gt( 17 ),
				foo: schema1.optional( ),
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
				v.object( { foo: v.string( ).const( "bar" ).optional( ) } )
			);
			const schema2 = suretype(
				{
					name: "Bar",
					description: "Desc",
					title: "T",
					examples: [ "Ex" ],
				},
				v.object( {
					bar: v.number( ).gt( 17 ),
					foo: schema1.optional( ),
					baz: inlined.optional( ),
					bak: inlined.optional( ),
				} )
			);

			const { schema: jsonSchemaOuter } =
				extractJsonSchema( [ schema1, schema2 ], { refMethod } );

			expect( jsonSchemaOuter ).toMatchSnapshot( );
		} )
	}

	it( "should keep references in lookup table", ( ) =>
	{
		const schema1 = suretype(
			{ name: "Foo" },
			v.number( )
		);
		const schema2 = v.anyOf( [ v.string( ), v.boolean( ) ] );
		const schema3 = v.anyOf( [ v.string( ), schema1 ] );

		const { schema, lookup, schemaRefName } = extractJsonSchema(
			[ schema1, schema2, schema3 ],
			{ onNonSuretypeValidator: 'lookup' }
		);

		expect( schema ).toMatchSnapshot( );
		expect( lookup.get( schema1 ) ).toMatchSnapshot( );
		expect( lookup.get( schema2 ) ).toMatchSnapshot( );
		expect( lookup.get( schema3 ) ).toMatchSnapshot( );
		expect( schemaRefName.get( lookup.get( schema1 ) ) ).toBe( 'Foo' );
		expect( schemaRefName.get( lookup.get( schema2 ) ) ).toBeUndefined( );
		expect( schemaRefName.get( lookup.get( schema3 ) ) ).toBeUndefined( );
	} );
} );
