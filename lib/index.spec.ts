import * as index from "./index"


describe( "index", ( ) =>
{
	it( "should expose an exact set of features", ( ) =>
	{
		expect( index ).toEqual( {
			// api/index
			v: {
				string: expect.any( Function ),
				number: expect.any( Function ),
				object: expect.any( Function ),
				array: expect.any( Function ),
				boolean: expect.any( Function ),
				null: expect.any( Function ),
				anyOf: expect.any( Function ),
				allOf: expect.any( Function ),
				if: expect.any( Function ),
				any: expect.any( Function ),
			},
			suretype: expect.any( Function ),

			// JSON Schema extraction
			extractJsonSchema: expect.any( Function ),
			extractSingleJsonSchema: expect.any( Function ),

			// Errors
			DuplicateConstraintError: expect.any( Function ),
			DuplicateError: expect.any( Function ),

			// Validation schema lookup
			getValidatorSchema: expect.any( Function ),

			// json-schema
			compile: expect.any( Function ),
			validate: expect.any( Function ),
		} );
	} );
} );
