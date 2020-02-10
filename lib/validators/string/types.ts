
/**
 * String formats. The description is taken from here:
 * https://json-schema.org/understanding-json-schema/reference/string.html
 */
export type Formats =
	// Date and time together, for example, 2018-11-13T20:20:39+00:00.
	| "date-time"
	// New in draft 7 Time, for example, 20:20:39+00:00
	| "time"
	// New in draft 7 Date, for example, 2018-11-13.
	| "date"

	// Internet email address, see RFC 5322, section 3.4.1.
	| "email"
	// New in draft 7 The internationalized form of an Internet email address,
	// see RFC 6531.
	| "idn-email"

	// Internet host name, see RFC 1034, section 3.1.
	| "hostname"
	// New in draft 7 An internationalized Internet host name, see RFC5890,
	// section 2.3.2.3.
	| "idn-hostname"

	// IPv4 address, according to dotted-quad ABNF syntax as defined in
	// RFC 2673, section 3.2.
	| "ipv4"
	// IPv6 address, as defined in RFC 2373, section 2.2.
	| "ipv6"

	// A universal resource identifier (URI), according to RFC3986.
	| "uri"
	// New in draft 6 A URI Reference (either a URI or a relative-reference),
	// according to RFC3986, section 4.1.
	| "uri-reference"
	// New in draft 7 The internationalized equivalent of a “uri”, according
	// to RFC3987.
	| "iri"
	// New in draft 7 The internationalized equivalent of a “uri-reference”,
	// according to RFC3987
	| "iri-reference"

	// New in draft 6 A URI Template (of any level) according to RFC6570.
	// If you don’t already know what a URI Template is, you probably don’t
	// need this value.
	| "uri-template"

	// New in draft 6 A JSON Pointer, according to RFC6901. There is more
	// discussion on the use of JSON Pointer within JSON Schema in Structuring
	// a complex schema. Note that this should be used only when the entire
	// string contains only JSON Pointer content, e.g. /foo/bar. JSON Pointer
	// URI fragments, e.g. #/foo/bar/ should use "uri-reference".
	| "json-pointer"
	// New in draft 7 A relative JSON pointer.
	| "relative-json-pointer"

	// New in draft 7 A regular expression, which should be valid according to
	// the ECMA 262 dialect.
	| "regex";
