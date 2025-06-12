const path = require('path');

module.exports = {
	// TODO: Better result of minification: https://minify-js.com/ (ecma2016, module)
	target: ['web', 'es2020'],
	entry: './src/QReact.mjs',
	output: {
		filename: 'QReact.min.mjs',
		path: path.resolve(__dirname, 'publish'),
		library: {
			type: 'module',
		},
		clean: true,
	},
	experiments: {
		outputModule: true,
	},
};