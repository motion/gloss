// @flow
import fancyElFactory from './fancyElement'
import { StyleSheet } from './stylesheet'
import { pickBy } from 'lodash'
import { applyNiceStyles, flattenThemes, isFunc } from './helpers'

export { colorToString, objectToColor, expandCSSArray } from 'motion-nice-styles'
export type { Transform, Color } from 'motion-nice-styles'

function getDynamics(activeKeys: Array<string>, props: Object, styles: Object, propPrefix = '$') {
  const dynamicKeys = activeKeys
    .filter(k => styles[k] && typeof styles[k] === 'function')
  const dynamics = dynamicKeys
    .reduce((acc, key) => ({
      ...acc,
      [key]: styles[key](props[`${propPrefix}${key}`])
    }), {})
  return dynamics
}

function getSheets(dynamics, name: string) {
  const sheet = StyleSheet.create(applyNiceStyles(dynamics, `${name}`))
  return Object.keys(dynamics).map(key => ({ ...sheet[key], isDynamic: true, key }))
}

function getStyles({ name, style }, theme: ?Object) {
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

export default function glossFactory(opts: Object = {}): Function {
  let baseStyles
  if (opts.baseStyles) {
    baseStyles = getStyles({ name: 'Gloss Parent Styles', style: opts.baseStyles }, null)
  }

  const fancyEl = (styles, theme) =>
    fancyElFactory(theme, baseStyles, styles, opts, getDynamics, getSheets)

  return function gloss(ChildOrName: Function | string, style: ?Object) {
    // shorthand
    if (typeof ChildOrName === 'string') {
      const name = ChildOrName
      const createEl = fancyEl(getStyles({ name, style: { [name]: style } }))
      return props => createEl(name, props)
    }

    // using as decorator for class
    const Child = ChildOrName

    // shim this.fancyElement
    Child.prototype.fancyElement = fancyEl(
      getStyles(Child, opts.dontTheme ? null : Child.theme),
      Child.theme
    )

    return Child
  }
}

