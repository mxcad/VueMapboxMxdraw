const { defineConfig } = require('@vue/cli-service')


module.exports = defineConfig({
  publicPath: process.env.NODE_ENV === 'production' ? '/sample/vuemapbox' :  '/',
  transpileDependencies: true,

  lintOnSave: false,
  configureWebpack: {
		devtool: 'source-map',
    plugins: [
    ]
	},
  chainWebpack: (config) => {
    config.plugins.delete('prefetch')
  },
  // webpack-dev-server 相关配置
  devServer: {
    open: process.platform === 'darwin',
    // host: '',
    port: 8088,
    https: false
  }

})
