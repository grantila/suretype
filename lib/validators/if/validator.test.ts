import { IfValidator } from "./validator.js"
import { validatorType } from "../../validation.js"
import { validateJsonSchema, validate } from "../../json-schema.js"
import { RawValidator } from "../raw/validator.js"
import { StringValidator } from "../string/validator.js"
import { NumberValidator } from "../number/validator.js"
import { suretype } from "../../api/index.js"
import { extractSingleJsonSchema } from "../../extract-json-schema.js"


describe( "IfValidator", ( ) =>
{
	it( "Correct type", ( ) =>
	{
		expect( validatorType( new IfValidator( new StringValidator( ) ) ) )
			.toEqual( "if" );
	} );

	it( "Valid basic schema with only if", ( ) =>
	{
		const validator = new IfValidator( new StringValidator( ) );
		const { schema } = extractSingleJsonSchema( validator );
		expect( schema ).toEqual( {
			if: { type: "string" },
		} );

		expect( validateJsonSchema( schema ).ok ).toEqual( true );
		expect( validate( validator, false ).ok ).toEqual( true );
		expect( validate( validator, "foo" ).ok ).toEqual( true );
		expect( validate( validator, 3.14 ).ok ).toEqual( true );
	} );

	it( "Valid basic schema with if and then", ( ) =>
	{
		const validator =
			new IfValidator( new StringValidator( ) )
			.then( new StringValidator( ).enum( "foo", "bar" ) );
		const { schema } = extractSingleJsonSchema( validator );

		expect( schema ).toEqual( {
			if: { type: "string" },
			then: { type: "string", enum: [ "foo", "bar" ] },
		} );

		expect( validateJsonSchema( schema ).ok ).toEqual( true );
		expect( validate( validator, false ).ok ).toEqual( true );
		expect( validate( validator, "foo" ).ok ).toEqual( true );
		expect( validate( validator, "bar" ).ok ).toEqual( true );
		expect( validate( validator, "baz" ).ok ).toEqual( false );
		expect( validate( validator, 3.14 ).ok ).toEqual( true );
	} );

	it( "Valid basic schema with if and else", ( ) =>
	{
		const validator =
			new IfValidator( new StringValidator( ) )
			.else( new NumberValidator( ).enum( 17, 42 ) );
		const { schema } = extractSingleJsonSchema( validator );

		expect( schema ).toEqual( {
			if: { type: "string" },
			else: { type: "number", enum: [ 17, 42 ] },
		} );

		expect( validateJsonSchema( schema ).ok ).toEqual( true );
		expect( validate( validator, false ).ok ).toEqual( false );
		expect( validate( validator, "foo" ).ok ).toEqual( true );
		expect( validate( validator, "bar" ).ok ).toEqual( true );
		expect( validate( validator, "baz" ).ok ).toEqual( true );
		expect( validate( validator, 3.14 ).ok ).toEqual( false );
		expect( validate( validator, 17 ).ok ).toEqual( true );
		expect( validate( validator, 18 ).ok ).toEqual( false );
		expect( validate( validator, 42 ).ok ).toEqual( true );
	} );

	it( "Valid basic schema with if, then, else", ( ) =>
	{
		const validator =
			new IfValidator( new StringValidator( ) )
			.then( new StringValidator( ).enum( "foo", "bar" ) )
			.else( new NumberValidator( ).enum( 17, 42 ) );
		const { schema } = extractSingleJsonSchema( validator );

		expect( schema ).toEqual( {
			if: { type: "string" },
			then: { type: "string", enum: [ "foo", "bar" ] },
			else: { type: "number", enum: [ 17, 42 ] },
		} );

		expect( validateJsonSchema( schema ).ok ).toEqual( true );
		expect( validate( validator, false ).ok ).toEqual( false );
		expect( validate( validator, "foo" ).ok ).toEqual( true );
		expect( validate( validator, "bar" ).ok ).toEqual( true );
		expect( validate( validator, "baz" ).ok ).toEqual( false );
		expect( validate( validator, 3.14 ).ok ).toEqual( false );
		expect( validate( validator, 17 ).ok ).toEqual( true );
		expect( validate( validator, 18 ).ok ).toEqual( false );
		expect( validate( validator, 42 ).ok ).toEqual( true );
	} );


	it( "Valid basic schema with if, then, else with raw validators", ( ) =>
	{
		const validator =
			new IfValidator( new RawValidator( { type: "string" } ) )
			.then(
				new RawValidator( { type: "string", enum: [ "foo", "bar" ] } )
			)
			.else( new RawValidator( { type: "number", enum: [ 17, 42 ] } ) );
		const { schema } = extractSingleJsonSchema( validator );

		expect( schema ).toEqual( {
			if: { type: "string" },
			then: { type: "string", enum: [ "foo", "bar" ] },
			else: { type: "number", enum: [ 17, 42 ] },
		} );

		expect( validateJsonSchema( schema ).ok ).toEqual( true );
		expect( validate( validator, false ).ok ).toEqual( false );
		expect( validate( validator, "foo" ).ok ).toEqual( true );
		expect( validate( validator, "bar" ).ok ).toEqual( true );
		expect( validate( validator, "baz" ).ok ).toEqual( false );
		expect( validate( validator, 3.14 ).ok ).toEqual( false );
		expect( validate( validator, 17 ).ok ).toEqual( true );
		expect( validate( validator, 18 ).ok ).toEqual( false );
		expect( validate( validator, 42 ).ok ).toEqual( true );
	} );

	it( "else should clone properly", ( ) =>
	{
		const validator1 =
			new IfValidator( new StringValidator( ) )
			.then( new StringValidator( ).enum( "foo", "bar" ) )
			.else( new NumberValidator( ).enum( 17, 42 ) );
		const validator2 = suretype( { name: "copy" }, validator1 );

		const schema1 = extractSingleJsonSchema( validator1 );
		const schema2 = extractSingleJsonSchema( validator2 );

		expect( schema1 ).toEqual( schema2 );
		expect( validateJsonSchema( schema1 ).ok ).toEqual( true );
	} );
} );
