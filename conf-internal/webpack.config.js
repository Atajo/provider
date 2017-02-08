var webpackUglifyJsPlugin = require('webpack-uglify-js-plugin');
var path = require('path');


module.exports = {
    entry: './main.ts',
    output: {
        filename: 'bundle.js'
    },
    plugins: [
        new webpackUglifyJsPlugin({
            minimize: true,
            cacheFolder: path.resolve(__dirname, '../', '../', 'cache', 'cached_uglify'),
        })
    ],
    resolve: {
        extensions: ['.webpack.js', '.web.js', '.ts', '.js']
    },
    module: {
        loaders: [
            { test: /\.ts$/, loader: 'ts-loader' }
        ]
    }
}