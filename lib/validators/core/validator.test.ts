import { CoreValidator, exposeCoreValidator } from "./validator.js"
import { extractSingleJsonSchema } from "../../extract-json-schema.js"
import { getAnnotations } from "../../annotations.js"
import { annotate } from "../../api/index.js"
import { AnyType } from "../types.js"


describe( "CoreValidator", ( ) =>
{
	class X extends CoreValidator< string >
	{
		type: AnyType = 'any';

		protected toSchema( )
		{
			return { foo: "bar" };
		}
		protected clone( clean: boolean )
		{
			return new X( ) as this;
		}
		public getJsonSchemaObject( )
		{
			return super.getJsonSchemaObject( undefined as any );
		}
	}

	it( "JSON schema is extractable", ( ) =>
	{
		expect( exposeCoreValidator( new X( ) ).toSchema( undefined as any ) )
			.toEqual( { foo: "bar" } );

		expect( extractSingleJsonSchema( new X( ) ).schema )
			.toEqual( { foo: "bar" } );
	} );

	it( "handles no annotations", ( ) =>
	{
		const validator = new X( );
		expect( getAnnotations( validator ) ).toEqual( undefined );
		expect( validator.getJsonSchemaObject( ) ).toStrictEqual( { } );
	} );

	it( "handles annotations", ( ) =>
	{
		const name = 'Name';
		const title = 'Title';
		const description = 'Desc';
		const examples = [ 'ex1' ];

		const validator = annotate(
			{ name, title, description, examples },
			new X( )
		);
		expect( getAnnotations( validator ) )
			.toStrictEqual( { name, title, description, examples } );
		expect( validator.getJsonSchemaObject( ) )
			.toStrictEqual( { title, description, examples } );
	} );
} );
