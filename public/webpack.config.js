// run webpack-dev-server --content-base dist
// https://webpack.github.io/docs/configuration.html
const webpack = require('webpack');
const path = require('path');
const MinifyPlugin = require('babel-minify-webpack-plugin');

module.exports = {
    entry: {
        'management/login': './src/management/login.js',
        'management/console': './src/management/console.js'
    },
    output: {
        path: path.join(__dirname, '/dist'),
        filename: '[name].bundle.js',
        publicPath: '/'
    },
    devtool: '#source-map',
    devServer: {
        contentBase: './dist'
    },
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                loader: 'babel-loader',
                query: {
                    presets: ['es2015', 'react']
                },
                include: path.join(__dirname, '/src')
            },
            { test: /\.json$/, loader: 'json-loader' },
            { test: /\.css$/, loader: 'style-loader!css-loader', exclude: path.join(__dirname, '/node_modules') },
            { test: /\.scss$/, loader: 'style-loader!css-loader!sass-loader', exclude: path.join(__dirname, '/node_modules') },
            { test: /\.woff(\d+)?$/, loader: 'url?prefix=font/&limit=5000&mimetype=application/font-woff' },
            { test: /\.ttf$/, loader: 'file?prefix=font/' },
            { test: /\.eot$/, loader: 'file?prefix=font/' },
            { test: /\.svg$/, loader: 'file?prefix=font/' },
            { test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'url-loader?limit=10000&minetype=application/font-woff' },
            { test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'file-loader' },
            { test: /\.(png|woff|woff2|eot|ttf|svg)$/, loader: 'url-loader?limit=100000' },
            { test: require.resolve('jquery'), loader: 'expose-loader?jQuery!expose-loader?$' }

        ]
    },
    plugins: [
        new webpack.ProvidePlugin({
            jQuery: 'jquery',
            $: 'jquery',
            jquery: 'jquery'
        })
        // ,new MinifyPlugin()
    ]
};
