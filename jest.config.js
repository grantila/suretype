export default {
	resolver: 'ts-jest-resolver',
	testEnvironment: 'node',
	testMatch: [ '<rootDir>/lib/**/*.test.ts' ],
	collectCoverageFrom: [ '<rootDir>/lib/**' ],
	coveragePathIgnorePatterns: [ '/node_modules/', '/test/', '/__snapshots__/' ],
	coverageReporters: [ 'lcov', 'text', 'html' ],
	extensionsToTreatAsEsm: [ '.ts' ],
	setupFiles: [
		'./lib/json-schema-nodejs.ts',
		'./lib/ajv-errors-nodejs.ts',
	],
};
