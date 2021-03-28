import { RawValidator } from "./validator"
import { validateJsonSchema, validate } from "../../json-schema"
import { extractSingleJsonSchema } from "../../extract-json-schema"


describe( "RawValidator", ( ) =>
{
	it( "Valid basic schema", ( ) =>
	{
		const validator = new RawValidator( { type: 'string' } );
		const { schema } = extractSingleJsonSchema( validator );
		expect( schema ).toEqual( { type: "string" } );

		expect( validateJsonSchema( schema ).ok ).toEqual( true );
		expect( validate( validator, true ).ok ).toEqual( false );
		expect( validate( validator, [ ] ).ok ).toEqual( false );
		expect( validate( validator, 3.14 ).ok ).toEqual( false );
		expect( validate( validator, { } ).ok ).toEqual( false );
		expect( validate( validator, null ).ok ).toEqual( false );
		expect( validate( validator, "3.14" ).ok ).toEqual( true );
		expect( validate( validator, "foo" ).ok ).toEqual( true );
	} );
} );
