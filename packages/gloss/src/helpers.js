// @flow
import motionStyle from 'motion-css'

// flatten theme key
// { theme: { dark: { h1: { color: 'red' } } } }
// => { dark-button: { h1: { color: 'red' } } }
export function flattenThemes(themes: ?Object) {
  const themeObj = themes || {}
  let result = {}

  Object.keys(themeObj).forEach(tKey => {
    const theme = themeObj[tKey]

    if (typeof theme === 'object') {
      result = {
        ...result,
        // flatten themes to `theme-tag: {}`
        ...Object.keys(theme).reduce(
          (res, key) => ({ ...res, [`${tKey}-${key}`]: theme[key] }),
          {}
        ),
      }
    } else if (typeof theme === 'function') {
      // skip function themes
      return
    } else {
      console.log(
        `Note: themes must be an object or function, "${tKey}" is a ${typeof tKey}`
      )
    }
  })

  return result
}

export function applyNiceStyles(styles: Object, errorMessage: string) {
  for (const style in styles) {
    if (!styles.hasOwnProperty(style)) {
      continue
    }
    const value = styles[style]
    if (value) {
      styles[style] = motionStyle(value, errorMessage)
    }
  }

  return styles
}

export const isFunc = (x: any) => typeof x === 'function'
export const filterStyleKeys = (arr: Array<string>) =>
  arr.filter(key => key[0] === '$' && key[1] !== '$')
export const filterParentStyleKeys = (arr: Array<string>) =>
  arr.filter(key => key[0] === '$' && key[1] === '$')
