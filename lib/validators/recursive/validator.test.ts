import { RecursiveValidator } from "./validator.js"
import { validatorType } from "../../validation.js"
import { suretype, v } from "../../api/index.js"
import {
	extractSingleJsonSchema,
	extractJsonSchema,
} from "../../extract-json-schema.js"


describe( "RecursiveValidator", ( ) =>
{
	it( "Correct type", ( ) =>
	{
		expect( validatorType( new RecursiveValidator( ) ) )
			.toEqual( "recursive" );
	} );

	it( "Valid basic schema", ( ) =>
	{
		expect( extractSingleJsonSchema( new RecursiveValidator( ) ).schema )
			.toEqual( { $ref: "#/definitions/Unknown_1" } );
	} );

	it( "Valid basic suretype'd schema", ( ) =>
	{
		const schema = suretype(
			{ name: 'Foo' },
			new RecursiveValidator( )
		);
		expect( extractSingleJsonSchema( schema ).schema )
			.toStrictEqual( { $ref: "#/definitions/Foo" } );
	} );

	it( "Single complex suretype'd schema", ( ) =>
	{
		const schema = suretype(
			{ name: 'Foo' },
			v.object( {
				foo: v.number( ),
				bar: v.recursive( ),
			} )
		);
		expect( extractSingleJsonSchema( schema ).schema ).toStrictEqual( {
			type: "object",
			properties: {
				foo: { type: "number" },
				bar: { $ref: "#/definitions/Foo" },
			}
		} );
	} );

	it( "Multiple complex suretype'd schemas", ( ) =>
	{
		const schema1 = suretype(
			{ name: 'Foo' },
			v.object( {
				foo: v.number( ),
				bar: v.recursive( ),
			} )
		);
		const schema2 = suretype(
			{ name: 'Bar' },
			v.object( {
				foo2: schema1,
				bar2: v.recursive( ),
			} )
		);
		const { schema } = extractJsonSchema( [ schema1, schema2 ] );
		expect( schema ).toStrictEqual( {
			definitions: {
				Foo: {
					type: "object",
					properties: {
						foo: { type: "number" },
						bar: { $ref: "#/definitions/Foo" },
					}
				},
				Bar: {
					type: "object",
					properties: {
						foo2: { $ref: "#/definitions/Foo" },
						bar2: { $ref: "#/definitions/Bar" },
					}
				},
			}
		} );
	} );
} );
