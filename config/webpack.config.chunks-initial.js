const merge = require('webpack-merge')
const path = require('path')
const common = require('./webpack.config.common')

module.exports = merge(common, {
    optimization: {
        splitChunks: {
          chunks: 'initial',
          minSize: 30000,
          minChunks: 1,
          maxAsyncRequests: 5,
          maxInitialRequests: 3,
          automaticNameDelimiter: '~',
          name: true,
          cacheGroups: {
            vendors: {
              test: /[\\/]node_modules[\\/]/,
              priority: -10
            },
            default: {
              minChunks: 1,
              priority: -20,
              reuseExistingChunk: true
            }
          }
        },
      },
    entry: {
        entry1: path.resolve(__dirname, '../src/entry1.js'),
        entry2: path.resolve(__dirname, '../src/entry2.js')
    }
})