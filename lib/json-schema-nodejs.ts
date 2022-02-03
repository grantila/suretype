import { readFileSync } from "node:fs"
import { createRequire } from "node:module"

import { setSchemaDraft07 } from "./json-schema.js"


const require = createRequire( import.meta.url );
const filename =
	require.resolve( "ajv/lib/refs/json-schema-draft-07.json" );

const jsonSchemaSchema = JSON.parse(
	readFileSync( filename, "utf-8" )
);

setSchemaDraft07( jsonSchemaSchema );
