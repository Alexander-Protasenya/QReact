const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
	entry: './demo/App.mjs',
	output: {
		filename: 'bundle.[contenthash].js',
		path: path.resolve(__dirname, 'publish'),
		clean: true,
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