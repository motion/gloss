// @flow
import fancyElement from './fancyElement'
import motionStyle from '@mcro/css'
import { StyleSheet } from './stylesheet'

// exports
export { colorToString, objectToColor, expandCSSArray } from '@mcro/css'
export type { Transform, Color } from '@mcro/css'
// export components
export ThemeProvide from './components/themeProvide'
export Theme from './components/theme'

export type Options = {
  themeKey: string | boolean,
  baseStyles?: Object,
  tagName?: boolean,
  processColor?: Function,
}

const DEFAULT_OPTS = {
  themeKey: 'theme',
}

export class Gloss {
  options: Options

  makeCreateEl = styles => fancyElement(this, this.getStyles(styles))

  constructor(opts: Options = DEFAULT_OPTS) {
    this.options = opts
    this.niceStyle = motionStyle(opts)
    this.baseStyles = opts.baseStyles && this.getStyles(opts.baseStyles)
    this.createElement = this.makeCreateEl()
    this.decorator.createElement = this.createElement
  }

  decorator = (Child: Function | string, style: ?Object) => {
    // shorthand
    if (typeof Child === 'string') {
      const name = Child
      const createEl = this.makeCreateEl({ [name]: style }, name)
      return ({ getRef, ...props }) => createEl(name, { ref: getRef, ...props })
    }

    if (Child.prototype) {
      Child.prototype.glossElement = this.makeCreateEl(Child.style, 'style')
      Child.prototype.gloss = this.niceStyleSheet
      if (Child.theme && typeof Child.theme === 'function') {
        const getStyles = this.getStyles
        const ogRender = Child.prototype.render
        Child.prototype.render = function(...args) {
          const activeTheme =
            this.context.uiTheme &&
            this.context.uiTheme[this.context.uiActiveTheme || this.props.theme]
          if (activeTheme) {
            this.theme = getStyles(Child.theme(this.props, activeTheme, this))
          }
          return ogRender.call(this, ...args)
        }
      }
    }
    return Child
  }

  niceStyleSheet = (styles: Object, errorMessage: string) => {
    for (const style in styles) {
      if (!styles.hasOwnProperty(style)) continue
      const value = styles[style]
      if (value) {
        styles[style] = this.niceStyle(value, errorMessage)
      }
    }
    return styles
  }

  // runs niceStyleSheet on non-function styles
  getStyles = styles => {
    if (!styles) {
      return null
    }
    const functionalStyles = {}
    const staticStyles = {}
    for (const [key, val] of Object.entries(styles)) {
      if (typeof val === 'function') {
        functionalStyles[key] = val // to be run later
      } else {
        staticStyles[key] = val
      }
    }
    const stylesheet = {
      ...StyleSheet.create(this.niceStyleSheet(staticStyles)),
      ...functionalStyles,
    }
    return stylesheet
  }
}

export default function glossFactory(options: Options): Function {
  return new Gloss(options)
}
