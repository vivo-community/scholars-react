const Webpack = require("webpack");
const { resolve } = require('path');
const Glob = require("glob");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const ManifestPlugin = require("webpack-manifest-plugin");
const CleanObsoleteChunks = require('webpack-clean-obsolete-chunks');
const TerserPlugin = require("terser-webpack-plugin");
const LiveReloadPlugin = require('webpack-livereload-plugin');
const Dotenv = require('dotenv-webpack');

const vivoRegex = RegExp('vivo*');

const configurator = {
  entries: function(){
    var entries = {
      application: [
        './assets/css/application.scss',
      ],
    }

    Glob.sync("./assets/*/*.*").forEach((entry) => {
      if (entry === './assets/css/application.scss') {
        return
      }

      let key = entry.replace(/(\.\/assets\/(src|js|css|go)\/)|\.(ts|js|s[ac]ss|go)/g, '')
      if(key.startsWith("_") || (/(ts|js|s[ac]ss|go)$/i).test(entry) == false) {
        return
      }

      if( entries[key] == null) {
        entries[key] = [entry]
        return
      }

      entries[key].push(entry)
    })
    return entries
  },

  plugins() {
    var plugins = [
      new CleanObsoleteChunks(),
      new MiniCssExtractPlugin({filename: "[name].[contenthash].css"}),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: "./assets",
            to: "", 
            globOptions: {
              ignore: ["css/**", "js/**", "src/**"]
            }
          }
        ]
      }),
      new Webpack.LoaderOptionsPlugin({minimize: true,debug: false}),
      new ManifestPlugin({
        fileName: "manifest.json"
      }),
      new Dotenv({
        systemvars: true // load all the predefined 'process.env' variables
      })
    ];

    return plugins
  },

  moduleOptions: function() {
    return {
      rules: [
        {
          test: /\.s[ac]ss$/,
          use: [
            MiniCssExtractPlugin.loader,
            { loader: "css-loader", options: {sourceMap: true}},
            { loader: "sass-loader", options: {sourceMap: true}}
          ]
        },
        { test: /\.jsx?$/,loader: "babel-loader",exclude: /node_modules/ },
        { test: /\.js?$/,loader: "babel-loader",exclude: /node_modules/ },
        { test: /\.(woff|woff2|ttf|svg)(\?v=\d+\.\d+\.\d+)?$/,use: "url-loader"},
        { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,use: "file-loader" },
      ]
    }
  },

  buildConfig: function(){
    // NOTE: If you are having issues with this not being set "properly", make
    // sure your GO_ENV is set properly as `buffalo build` overrides NODE_ENV
    // with whatever GO_ENV is set to or "development".
    const env = process.env.NODE_ENV || "development";

    var config = {
      mode: env,
      entry: configurator.entries(),
      output: {
        filename: (chunkData) => {
          // TODO: need a way to match web-components only
          // name? 
          // e.g. 
          return vivoRegex.test(chunkData.chunk.name)
          //return chunkData.chunk.name === 'loader'
              ? '[name].js'
              : '[name].[hash].js';
        },
        //filename: "[name].[hash].js", 
        path: `${__dirname}/public/assets`
      },
      plugins: configurator.plugins(),
      module: configurator.moduleOptions(),
      resolve: {
        extensions: ['.ts', '.js', '.json']
      }
    }

    if( env === "development" ){
      config.plugins.push(new LiveReloadPlugin({appendScriptTag: true}))
      return config
    }

    config.optimization = {
      minimize: true,
      minimizer: [new TerserPlugin()]
    }

    return config
  }
}

module.exports = configurator.buildConfig()
