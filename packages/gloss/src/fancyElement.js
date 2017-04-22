import React from 'react'
import { css } from './stylesheet'
import { omit } from 'lodash'
import { filterStyleKeys, filterParentStyleKeys } from './helpers'

const objToFlatArray = obj =>
  Object.keys(obj).reduce((acc, cur) => [...acc, ...obj[cur]], [])
const originalCreateElement = React.createElement

// factory that returns fancyElement helper
export default function fancyElementFactory(
  theme,
  parentStyles,
  styles,
  opts,
  getDynamics,
  getSheet
) {
  const shouldTheme = !opts.dontTheme
  const processTheme = shouldTheme && theme

  return function fancyElement(type, props, ...children) {
    // <... $one $two /> keys
    const propKeys = props ? Object.keys(props) : []
    const styleKeys = filterStyleKeys(propKeys)

    // remove $
    const activeKeys = styleKeys
      .filter(key => props[key] !== false && typeof props[key] !== 'undefined')
      .map(key => key.slice(1))

    // tag + $props
    // don't style <Components />!
    const isTag = typeof type === 'string'
    const allKeys = isTag ? [type, ...activeKeys] : activeKeys

    // collect styles, in order
    // { propKey: [styles] }
    const finalStyles = allKeys.reduce(
      (acc, cur) => {
        acc[cur] = []
        return acc
      },
      { parents: [] }
    )

    //
    // 1. parent styles
    //
    let parentStyleKeys

    if (parentStyles) {
      parentStyleKeys = filterParentStyleKeys(propKeys)

      if (parentStyleKeys.length) {
        const parentStyleNames = parentStyleKeys.map(k => k.replace('$$', ''))

        // dynamic
        if (parentStyles.dynamics) {
          const dynamics = getSheet(
            getDynamics(parentStyleNames, props, parentStyles.dynamics, '$$')
          )
          for (const sheet of dynamics) {
            finalStyles.parents.push(sheet)
          }
        }

        // static
        if (parentStyles.statics) {
          for (const key of parentStyleNames) {
            finalStyles.parents.push(parentStyles.statics[key])
          }
        }
      }
    }

    //
    // 2. own styles
    //
    // static
    if (styles.statics) {
      for (const key of allKeys) {
        finalStyles[key].push(styles.statics[key])
      }
    }

    // dynamic
    if (styles.dynamics && activeKeys.length) {
      const dynamics = getSheet(getDynamics(activeKeys, props, styles.dynamics))
      for (const sheet of dynamics) {
        finalStyles[sheet.key].push(sheet)
      }
    }

    //
    // 3. theme styles
    //
    let themeKeys

    if (processTheme) {
      // direct
      const themes = this.constructor.theme
      themeKeys = themes && Object.keys(themes)

      if (themes && themeKeys.length) {
        for (const prop of themeKeys) {
          const isDynamic = typeof styles.theme[prop] === 'function'

          // static theme
          if (!isDynamic && this.props[prop] === true) {
            for (const key of allKeys) {
              finalStyles[key].push(styles.statics[`${prop}-${key}`])
            }
          }

          // dynamic theme + has a prop value
          if (isDynamic && typeof this.props[prop] !== 'undefined') {
            // dynamic themes
            const dynStyles = styles.theme[prop](this.props)
            const dynKeys = Object.keys(dynStyles).filter(
              tag => allKeys.indexOf(tag) > -1
            )

            if (dynKeys.length) {
              const activeDynamics = dynKeys.reduce(
                (acc, cur) => ({ ...acc, [cur]: dynStyles[cur] }),
                {}
              )
              const dynamics = getSheet(activeDynamics)
              for (const sheet of dynamics) {
                finalStyles[sheet.key].push(sheet)
              }
            }
          }
        }
      }
    }

    //
    // finish
    //

    // remove style props
    const newProps = omit(props, [].concat(styleKeys, parentStyleKeys))

    // gather styles flat
    const activeStyles = objToFlatArray(finalStyles)

    if (activeStyles.length) {
      // apply styles
      newProps.className = css(...activeStyles)

      // keep original classNames
      if (props && props.className && typeof props.className === 'string') {
        newProps.className += ` ${props.className}`
      }
    }

    return originalCreateElement(type, newProps, ...children)
  }
}
