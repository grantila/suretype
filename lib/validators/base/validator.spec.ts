import { Type } from "../types"
import { BaseValidator } from "./validator"
import { validatorType } from "../../validation"
import { extractSingleJsonSchema } from "../../extract-json-schema"


describe( "BaseValidator", ( ) =>
{
	class X extends BaseValidator< string, X >
	{
		protected type: Type = "string";
		protected toSchema( )
		{
			return { foo: "bar" };
		}
		protected clone( clean: boolean )
		{
			return this.setupClone( clean, new X( ) );
		}
	}

	it( "Type is extractable", ( ) =>
	{
		expect( validatorType( new X( ) ) ).toEqual( "string" );
	} );

	it( "JSON schema is extractable", ( ) =>
	{
		expect( extractSingleJsonSchema( new X( ) ).schema )
			.toEqual( { foo: "bar" } );
	} );
} );
