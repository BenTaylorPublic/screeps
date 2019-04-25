const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');


module.exports = {
    entry: './dist/main.js',
    output: {
        pathinfo: true,
        libraryTarget: "commonjs2",
        path: path.resolve(__dirname, 'pack')
    },
    target: "node",
    node: {
        console: true,
        global: true,
        process: false,
        Buffer: false,
        __filename: false,
        __dirname: false,
    },
    optimization: {
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    parse: {},
                    compress: {},
                    mangle: false
                },
            }),
        ],
    },
};
