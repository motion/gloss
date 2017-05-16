import React from 'react'
import { css } from './stylesheet'
import { omit } from 'lodash'
import { filterStyleKeys, filterParentStyleKeys } from './helpers'
import deepExtend from 'deep-extend'

const flatten = arr => [].concat.apply([], arr)

const arrayOfObjectsToObject = arr => {
  let res = arr[0]
  for (let i = 1; i < arr.length; i++) {
    deepExtend(res, arr[i])
  }
  return res
}

const objToFlatArray = obj =>
  Object.keys(obj).reduce((acc, cur) => [...acc, ...obj[cur]], [])

const ogCreateElement = React.createElement

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
    const allStyleKeys = propKeys.filter(key => key[0] === '$')
    const newProps = omit(props, allStyleKeys)

    // gather styles flat
    const activeStyles = objToFlatArray(finalStyles)
    const hasStyleProp = props && props.style && props.style.gloss === true

    if (hasStyleProp || activeStyles.length) {
      // tags get classnames
      if (isTag) {
        if (hasStyleProp) {
          activeStyles.push({ style: props.style })
          delete newProps.style
        }

        // apply styles
        newProps.className = css(...activeStyles)

        // keep original classNames
        if (props && props.className && typeof props.className === 'string') {
          newProps.className += ` ${props.className}`
        }
      } else {
        // components get a style prop
        // filter for both $ and style props to merge them properly
        const keysIncludingStyle = propKeys.filter(
          key => key[0] === '$' || key === 'style'
        )

        // find all styles in order and merge into flat array
        const allStyles = flatten(
          keysIncludingStyle.map(key => {
            if (key === 'style') {
              return props[key]
            }
            const styles = key[1] === '$'
              ? finalStyles.parents.filter(x => x && x.key === key.slice(2))
              : finalStyles[key.slice(1)]

            if (!styles) {
              return null
            }

            const flattened = styles
              .filter(style => !!style)
              .map(style => style && style.style)
            return arrayOfObjectsToObject(flattened)
          })
        ).filter(style => !!style)

        // merge together nicely
        newProps.style = arrayOfObjectsToObject(allStyles)
      }
    }

    return ogCreateElement(type, newProps, ...children)
  }
}
