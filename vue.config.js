const path = require('path')

function resolve(dir) {
  return path.join(__dirname, dir)
}
module.exports = {
  publicPath: './',
  assetsDir: './',
  productionSourceMap: false,
  chainWebpack: config => {
    config.resolve.alias
      .set('@', resolve('src'))
      .set('tim', resolve('src/tim.js'))
  },
  css: {
    loaderOptions: {
      stylus: {
        'resolve url': true,
        // 自定义主题场景
        import: [path.resolve(__dirname, './src/assets/css/base.styl')]
      }
    }
  }
  // lintOnSave: true,
  // css: {
  //   loaderOptions: {
  //     postcss: {
  //       plugins: [
  //         require('postcss-plugin-px2rem')({
  // / / rootValue: 100, / / conversion base,the default 100, so that the root label font is defined as 1rem for 50px, so that you can measure from the design draft how many px directly in the code to write more px.
  /// / unitPrecision: 5, / / allows REM units to grow to decimal numbers.
  // / / propWhiteList: [], //the default value is an empty array, which means that whitelist is disabled and all properties are enabled.
  // / / propBlackList: [], / / blacklist
  // exclude:/ (node_module)/, //false by default, you can (reg) use regular expressions to exclude certain folders, such as/ (node_module)/.If you want to convert PX in the front-end UI framework to rem, set this property to the default value
  // / / selectorBlackList: [], //selectors to ignore and leave as px
  ////ignoreIdentifier: false, / / (boolean / string) method that ignores a single property, replace will automatically be set to true when ignoreidentifier is enabled.
  // / / replace: true, / / (boolean) replaces the rule that contains REM instead of adding a fallback.
  // mediaQuery: false, //(boolean) allows PX to be converted in media queries.
  //minPixelValue: 3 / / sets the minimum pixel value to be replaced(3px will be converted to rem). Default 0
  //         }),
  //       ]
  //     }
  //   }
  // },
}
