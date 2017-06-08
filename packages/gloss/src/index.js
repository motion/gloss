// @flow
import fancyElFactory from './fancyElement'
import { StyleSheet } from './stylesheet'
import { pickBy } from 'lodash'
import { applyNiceStyles, flattenThemes, isFunc } from './helpers'

// exports
export { colorToString, objectToColor, expandCSSArray } from 'motion-css'
export type { Transform, Color } from 'motion-css'
// export components
export ThemeProvide from './components/themeProvide'
export Theme from './components/theme'

function getStyles({ name, style }, theme: ?Object) {
  const styles = { ...style, ...flattenThemes(theme) }
  const dynamicStyles = pickBy(styles, isFunc)
  const staticStyles = pickBy(styles, x => !isFunc(x))
  const niceStatics = applyNiceStyles(staticStyles, `${name}:`)
  const statics = StyleSheet.create(niceStatics)
  // attach key to status objects so we can use later in fancyElement
  for (const key of Object.keys(statics)) {
    statics[key].key = key
  }
  return {
    statics,
    dynamics: dynamicStyles,
    theme,
  }
}

const DEFAULT_OPTS = {
  themeKey: 'theme',
}

export default function glossFactory(opts: Object = DEFAULT_OPTS): Function {
  let baseStyles
  if (opts.baseStyles) {
    baseStyles = getStyles(
      { name: 'Gloss Parent Styles', style: opts.baseStyles },
      null
    )
  }

  const fancyEl = (styles, theme) =>
    fancyElFactory(theme, baseStyles, styles, opts)

  function gloss(ChildOrName: Function | string, style: ?Object) {
    // shorthand
    if (typeof ChildOrName === 'string') {
      const name = ChildOrName
      const createEl = fancyEl(getStyles({ name, style: { [name]: style } }))
      return ({ getRef, ...props }) => createEl(name, { ref: getRef, ...props })
    }

    // using as decorator for class
    const Child = ChildOrName

    // shim this.fancyElement
    if (Child.prototype) {
      Child.prototype.glossElement = fancyEl(
        getStyles(Child, opts.dontTheme ? null : Child.theme),
        Child.theme
      )
    }

    return Child
  }

  // allow access directly to Gloss.createElement
  gloss.createElement = fancyEl(getStyles({ name: 'root', style: {} }))

  return gloss
}
