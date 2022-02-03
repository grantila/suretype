import { prettify } from "awesome-ajv-errors/dist/index-browser.js"
import { styledPrettify } from "awesome-ajv-errors/dist/index-try-styled.js"

import { setPrettify } from "./ajv-errors.js"
import { getSuretypeOptions, setSuretypeOptions } from "./options.js"

setPrettify( prettify );
styledPrettify
	.then( prettify =>
	{
		setPrettify( prettify );

		// Coerce stylings to true (unless already configured by the user)
		const opts = getSuretypeOptions( );
		opts.colors = opts.colors ?? true;
		opts.location = opts.location ?? true;
		opts.bigNumbers = opts.bigNumbers ?? true;
		setSuretypeOptions( opts );
	} );
