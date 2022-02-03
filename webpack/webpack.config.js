import webpack from 'webpack'
import HtmlWebpackPlugin from 'html-webpack-plugin'

const envs =
	process.env.HANDLE_STYLES
	? {
		'process.env.shouldHandleStyles': JSON.stringify( true ),
		'process.env.TERM_PROGRAM': JSON.stringify( process.env.TERM_PROGRAM ),
		'process.platform': JSON.stringify( process.platform ),
	}
	: {
		'process.env.shouldHandleStyles': JSON.stringify( false ),
	};

export default {
	entry: './src/index.ts',
	mode: 'production',
	plugins: [
		new HtmlWebpackPlugin( ),
		new webpack.DefinePlugin( envs ),
	],
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			},
		],
	},
	resolve: {
		extensions: [ '.tsx', '.ts', '.js', '.jsx' ],
	},
}
