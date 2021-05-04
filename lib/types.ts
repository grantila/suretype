export type ExportRefMethod =
	| 'no-refs'  // Don't ref anything. Inline all types to monolith types.
	| 'provided' // Reference types that are explicitly provided.
	| 'ref-all'; // Ref all provided types and those with names, suretype()'d.

export type OnTopLevelNameConflict =
	| 'error'   // Fail the operation
	| 'rename'; // Rename the validators to a unique name

export type OnNonSuretypeValidator =
	| 'error'       // Fail the operation
	| 'ignore'      // Ignore, don't export
	| 'create-name' // Create a name 'Unknown'
	| 'lookup';     // Provide in lookup table
