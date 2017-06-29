// @flow
import React from 'react'
import { StyleSheet, css } from './stylesheet'
import { filterStyleKeys, filterParentStyleKeys } from './helpers'
import deepExtend from 'deep-extend'
import type { Gloss } from './index'

const arrayOfObjectsToObject = (arr: Array<Object>) => {
  let res = {}
  for (let i = 0; i < arr.length; i++) {
    deepExtend(res, arr[i])
  }
  return res
}
const ogCreateElement = React.createElement.bind(React)
const TAG_NAME_MAP = {
  title: 'x-title',
  meta: 'x-meta',
}
const $ = '$'

// factory that returns fancyElement helper
export default function fancyElementFactory(Gloss: Gloss, styles: Object) {
  const { baseStyles, options, niceStyle } = Gloss
  const SHOULD_THEME = !options.dontTheme
  return function fancyElement(
    type: string | Function,
    props?: Object,
    ...children
  ) {
    let cssStyles
    const propNames = props ? Object.keys(props) : null
    const isTag = typeof type === 'string'
    const finalProps = {}
    const finalStyles = []

    const addStyle = (obj, key, val, checkTheme) => {
      const style = obj[key]
      if (!style) return
      if (typeof style === 'function') {
        const sheet = StyleSheet.create({ [type]: niceStyle(style(val)) })
        finalStyles.push(sheet[type])
      } else {
        finalStyles.push(style)
      }
      if (SHOULD_THEME && checkTheme && this.theme && this.theme[key]) {
        finalStyles.push(this.theme[key])
      }
    }

    if (styles && (isTag || type.name)) {
      const tagName = type.name || type
      addStyle(styles, tagName, null, true)
    }

    if (propNames) {
      for (const NAME of propNames) {
        const val = props && props[NAME]

        // non-style actions
        if (options.glossProp && NAME === options.glossProp) {
          // css={}
          cssStyles = val
          continue
        }
        if (
          options.tagName &&
          NAME === options.tagName &&
          isTag &&
          typeof val === 'string'
        ) {
          // tagName={}
          type = val
          continue
        }
        if (NAME[0] !== $) {
          // pass props down if not style prop
          finalProps[NAME] = val
          continue
        }

        // style actions
        if (val === false || val === null || val === undefined) {
          // ignore most falsy values (except 0)
          continue
        }
        if (baseStyles) {
          // $$style
          const isParentStyle = NAME[1] === $
          if (isParentStyle) {
            addStyle(baseStyles, NAME.slice(2), val)
            continue
          }
        }
        if (styles) {
          // $style
          addStyle(styles, NAME.slice(1), val, true)
        }
      }
    }

    // glossify and append style prop
    if (cssStyles) {
      const sheet = StyleSheet.create({ [type]: niceStyle(cssStyles) })
      finalStyles.push(sheet[type])
    }

    // styles => props
    if (finalStyles.length) {
      if (isTag) {
        // tags get className
        finalProps.className = css(...finalStyles)
        // keep original classNames
        if (props && props.className) {
          if (typeof props.className === 'string') {
            finalProps.className += ` ${props.className}`
          }
          // TODO: handle objects?
        }
      } else {
        // children get a style prop
        finalProps.style = arrayOfObjectsToObject(
          finalStyles.map(style => style && style.style)
        )
      }
    }

    return ogCreateElement(type, finalProps, ...children)
  }
}
