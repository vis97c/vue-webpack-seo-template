require('dotenv').config({path: '.env'});

const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
// const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');
require('es6-promise').polyfill();

const mode = process.env.NODE_ENV || 'development';
const isProduction = mode === 'production';
//webpack defaults
var config = {
    entry: {
        polyfill: '@babel/polyfill',
        main: './src/js/app.js'
    },
    resolve: {
        alias: {
            // svelte: path.resolve('node_modules', 'svelte'),
            '_src': path.resolve(__dirname, 'src'),
            '_components': path.resolve(__dirname, 'src/js/components'),
            '_helpers': path.resolve(__dirname, 'src/js/helpers'),
            '_assets': path.resolve(__dirname, 'src/assets'),
        },
        extensions: ['.js', '.vue'],
        // mainFields: ['svelte', 'browser', 'module', 'main']
    },
    output: {
        path: __dirname + '/public_html',
        filename: 'js/[name].js',
        chunkFilename: 'js/lazy/[name].js',
        publicPath: '/',
    },
    plugins: [
        // new DefinePlugin({
        //     'process.env': JSON.stringify(Dotenv.config().parsed)
        // }),
        new VueLoaderPlugin(),
    ],
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader'
                }
            },
            {
                test: /\.vue$/,
                exclude: /node_modules/,
                use: [
                    // 'babel-loader',
                    {
                        loader: 'vue-loader',
                        options: {
                            // emitCss: true,
                            hotReload: true,
                        }
                    }
                ]
            },
            {
                test: /\.css$/i,
                use: [
					/**
					 * MiniCssExtractPlugin doesn't support HMR.
					 * For developing, use 'style-loader' instead.
					 * */
                    isProduction ? MiniCssExtractPlugin.loader : 'vue-style-loader',
                    'css-loader' + (!isProduction ? '?sourceMap' : ''),
                ]
            },
            {
                test: /\.s[ac]ss$/i,
                use: [
                    // Creates `style` nodes from JS strings
                    isProduction ? MiniCssExtractPlugin.loader : 'vue-style-loader',
                    // Translates CSS into CommonJS
                    'css-loader' + (!isProduction ? '?sourceMap' : ''),
                    // Compiles Sass to CSS
                    'sass-loader' + (!isProduction ? '?sourceMap' : ''),
                ],
            },
            {
                test: /\.(png|jpg|gif|svg)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: 'images/[name].[ext]',
                        }
                    }
                ],
                
            },
            {
                test: /\.(mov|mp4|webm)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: 'video/[name].[ext]',
                        }
                    }
                ]
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: 'fonts/[name].[ext]',
                        }
                    }
                ],
            },
        ]
    },
    mode,
    devtool: isProduction ? false : 'source-map',
};
if (isProduction) {
    //production only
    const TerserPlugin = require('terser-webpack-plugin');
    const HtmlBeautifyPlugin = require('html-beautify-webpack-plugin');
    const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
    const PurgecssPlugin = require('purgecss-webpack-plugin')
    const glob = require('glob');
    const PATHS = {
        src: path.join(__dirname, 'src')
    }
    // const PurgeCss = require('@fullhuman/postcss-purgecss');
    // const CssNano = require('cssnano');
    config.plugins.push(
        new MiniCssExtractPlugin({
            filename: 'css/[name].css',
        }),
        new CopyPlugin([
            { from: 'src/to_public/default', to: '', dot: true },
            { from: 'src/to_public/production', to: '', dot: true },
        ]),
        new HtmlWebpackPlugin({
            filename: 'index.template',
            template: 'src/index.template.html',
            hash: true,
            minify: {
                removeComments: true,
                removeEmptyElements: false,
                minifyCSS: {
                    format: 'beautify'
                }
            }
        }),
        new HtmlBeautifyPlugin({
            config: {
                html: {
                    end_with_newline: false,
                    indent_size: 2,
                    indent_with_tabs: true,
                    indent_inner_html: true,
                    preserve_newlines: false,
                    // js: {},
                    // css: {}
                }
            }
        }),
        new PurgecssPlugin({
            paths: glob.sync(`${PATHS.src}/**/*`, { nodir: true }),
            whitelistPatterns: [/swal/, /vue-/]
        })
    );
    module.exports = Object.assign({}, config, {
        optimization: {
            // runtimeChunk: 'single',
        	splitChunks: {
        		chunks: 'all',
            },
            minimize: true,
            minimizer: [
                new TerserPlugin({
                    cache: true,
                    parallel: true,
                    // sourceMap: true, // Must be set to true if using source-maps in production
                    terserOptions: {
                        // https://github.com/webpack-contrib/terser-webpack-plugin#terseroptions
                        output: {
                            comments: false,
                        },
                    },
                    extractComments: false,
                }),
                new OptimizeCSSAssetsPlugin({
                    cssProcessor: require('cssnano'),
                    cssProcessorPluginOptions: {
                        'preset': [
                            'default', {
                                'discardComments': {
                                    'removeAll': true
                                }
                            }
                        ]
                    },
                })
                // new PurgeCss({
                //     content: [
                //         './src/**/*.html',
                //         './src/**/*.vue'
                //     ],
                //     whitelistPatterns: [/swal/]
                // }),
                // new CssNano({
                //     'preset': [
                //         'default', {
                //             'discardComments': {
                //                 'removeAll': true
                //             }
                //         }
                //     ]
                // })
            ],
        },
    });
} else {
    //dev only
    const WebpackNotifierPlugin = require('webpack-notifier');
    let proxy_url = process.env.PROXY_URL;
    config.plugins.push(
        new WebpackNotifierPlugin({
            title: 'Webpack Build',
            contentImage: path.join(__dirname, 'src/assets/logo.png'),
            alwaysNotify: true,
        }),
        new CopyPlugin([
            { from: 'src/to_public/default', to: '', dot: true },
            { from: 'src/to_public/dev', to: '', dot: true },
        ]),
        new HtmlWebpackPlugin({
            filename: 'index.template',
            template: 'src/index.template.html',
            hash: true,
        }),
        // new FriendlyErrorsPlugin(),
    );
    module.exports = Object.assign({}, config, {
        devServer: {
            port: 3000,
            hot: false,
            inline: true,
            contentBase: 'public_html',
            proxy: {
                '*': {
                    target: proxy_url,
                    secure: false,
                    changeOrigin: true
                }
            },
            historyApiFallback: true,
            open: true,
        },
    });
}