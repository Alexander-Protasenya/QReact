const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
	entry: './demo/App.mjs',
	output: {
		filename: 'bundle.js',
	},
	devServer: {
		port: 3000,
		open: true,
	},
	module: {
		rules: [
			{
				test: /\.(js|mjs|jsx)$/,
				exclude: /node_modules/,
				loader: 'babel-loader',
			},
		],
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: './index.html',
		}),
	],
};