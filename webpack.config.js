const webpack = require('webpack');
const Path = require('path');
const process = require('process');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const Visualizer = require('webpack-visualizer-plugin');

const NODE_ENV = process.env.NODE_ENV;

const extractCSSPlugin = new ExtractTextPlugin({
    filename: 'css/[name].css',
    allChunks: true
});

module.exports = {
    entry: {
        app: [
            Path.join(__dirname, 'src/angular/app.js')
        ],
        main: [
            Path.join(__dirname, 'src/scss/main.scss')
        ]
    },
    output: {
        filename: 'js/[name].js',
        path: Path.join(__dirname, 'web'),
        publicPath: '/'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: [/node_modules/],
                // use: ['eslint-loader']
            },
            {
                test: /\.(eot|woff2|woff|ttf)$/,
                use: {
                    loader: 'file-loader',
                    options: {
                        name: '[name].[hash].[ext]',
                    }
                }
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.scss$/,
                use: extractCSSPlugin.extract([
                    {loader: 'css-loader', options: {
                        url: false,
                        sourceMap: true
                    }},
                    {loader: 'sass-loader', options: {
                        sourceMap: true
                    }}
                ])
            }
        ]
    },
    plugins: [
        new CopyWebpackPlugin([
            // copy-html-index
            {from: 'src/index.html'},
            // {from: 'src/rev-manifest.json', to: 'web'},
            // copy-images
            {context: 'src/images', from: '**.*', to: 'images'},
            // copy-html-views
            {context: 'src/angular/Views', from: '**/*', to: 'views'},
            // copy-polygons
            {from: 'src/polygons.json'},
            // copy-libs
            {context: 'node_modules', from: 'angular-translate-loader-static-files/**', to: 'libs'},
            {context: 'node_modules', from: 'drmonty-leaflet-awesome-markers/**', to: 'libs'},
            {context: 'node_modules', from: 'Humanitarian-Font/**', to: 'libs'},
            {context: 'node_modules', from: 'leaflet.markercluster/**', to: 'libs'},
            {context: 'node_modules', from: 'mapbox.js/**', to: 'libs'},
            {context: 'node_modules', from: 'ngPrint/**', to: 'libs'}
        ]),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor',
            minChunks: function (module) {
                if (module.context) {
                    return module.context.indexOf('node_modules') !== -1 || module.context.indexOf('external') !== -1;
                }
            }
        }),
        extractCSSPlugin
    ],
    devServer: {
        contentBase: Path.join(__dirname, "web"),
        inline: true,
        historyApiFallback: false,
        stats: {colors: true}
    },
    devtool: 'source-map'
};

const bundleStatistics = new Visualizer({
    filename: './bundle-stats.html'
});
if (NODE_ENV !== 'production') {
    module.exports.plugins.push(bundleStatistics);
}
