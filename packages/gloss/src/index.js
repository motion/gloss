import fancyElementFactory from './fancyElement'
import { StyleSheet } from './stylesheet'
import { pickBy } from 'lodash'
import { applyNiceStyles, flattenThemes, isFunc } from './helpers'

// defaults
const defaultOpts = {}

module.exports = function motionStyle(opts = defaultOpts) {
  let baseStyles

  if (opts.baseStyles) {
    baseStyles = getStyles({ name: 'Gloss Parent Styles', style: opts.baseStyles }, null)
  }

  // decorator
  const decorator = (Child) => {
    // add to Child.prototype, so the decorated class can access: this.fancyElement
    const styles = getStyles(Child, opts.dontTheme ? null : Child.theme)
    Child.prototype.fancyElement = fancyElementFactory(Child, baseStyles, styles, opts, getDynamicStyles, getDynamicSheets)

    // allows this.addTheme('theme') from within a component
    const setTheme = val => function(...names) {
      for (const name of names) {
        this.__activeThemes = this.__activeThemes || {}
        this.__activeThemes[name] = val
      }
    }
    Child.prototype.addTheme = setTheme(true)
    Child.prototype.removeTheme = setTheme(false)
    return Child
  }

  return decorator
}

// option-based helpers
function getDynamicStyles(activeKeys: Array, props: Object, styles: Object, propPrefix = '$') {
  const dynamicKeys = activeKeys
    .filter(k => styles[k] && typeof styles[k] === 'function')

  const dynamics = dynamicKeys
    .reduce((acc, key) => ({
      ...acc,
      [key]: styles[key](props[`${propPrefix}${key}`])
    }), {})

  return dynamics
}

function getDynamicSheets(dynamics) {
  const sheet = StyleSheet.create(applyNiceStyles(dynamics, `${name}`))
  return Object.keys(dynamics).map(key => ({ ...sheet[key], isDynamic: true, key }))
}

function getStyles({ name, style }, theme) {
  const styles = { ...style, ...flattenThemes(theme) }

  const dynamicStyles = pickBy(styles, isFunc)

  const staticStyles = pickBy(styles, x => !isFunc(x))
  const niceStatics = applyNiceStyles(staticStyles, `${name}:`)
  const statics = StyleSheet.create(niceStatics)

  return {
    statics,
    dynamics: dynamicStyles,
    theme
  }
}
