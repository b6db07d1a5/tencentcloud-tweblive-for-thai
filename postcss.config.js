//postcss.config.js file
module.exports = {
  plugins: {
    'postcss-px-to-viewport': {
      unitToConvert: 'px', //The unit to be converted, the default is "px"
      viewportWidth: 375, // The width of the window, which corresponds to the width of our design draft
      // viewportHeight: 1334,//The height of the window is specified according to the width of the 375 device, generally 667 is specified, or not configured
      unitPrecision: 13,
      propList: ['*'], // property list that can be converted to vw
      viewportUnit: 'vw', // Specify the viewport unit that needs to be converted, vw is recommended
      fontViewportUnit: 'vw', //Viewport unit used by the font
      selectorBlackList: ['.ignore-', '.hairlines'], //Specify classes that are not converted to window units, you can customize them, and you can add them infinitely. It is recommended to define one or two general class names
      minPixelValue: 1, // Less than or equal to `1px` will not be converted to window units, you can also set the value you want
      mediaQuery: false, // Allow `px` to be converted in media queries
      replace: true, //Whether to directly replace the attribute value without adding alternate attributes
      exclude: [
        /node_modules/,
      ], //Ignore files under certain folders or specific files, such as files under'node_modules'
      landscape: false, //Whether to add media query conditions generated based on landscapeWidth @media (orientation: landscape)
      landscapeUnit: 'vw', //The unit used in landscape
      // landscapeWidth: 1134 //Viewport width used in landscape
    }
  }
}