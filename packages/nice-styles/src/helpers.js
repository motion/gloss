/* @flow */

import type { Color } from './types'

export function objectToColor(color: Color): string {
  if (Array.isArray(color)) {
    const length = color.length
    if (length === 4) {
      return `rgba(${color.join(', ')})`
    }
    if (length === 3) {
      return `rgb(${color.join(', ')})`
    }
    throw new Error('Invalid color provided')
  }
  if (color.a) {
    return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`
  }
  return `rgb(${color.r}, ${color.g}, ${color.b})`
}

export function expandCSSArray(given: number | Array) {
  if (!Array.isArray(given)) {
    return [given, given, given, given]
  }

  const oLen = given.length

  if (oLen === 4) {
    return given
  }

  given[3] = given[1]

  if (oLen === 3) {
    return given
  }

  given[2] = given[0]

  return given
}

export function isCSSAble(val) {
  return val !== null && (typeof val).match(/function|object/) && (
    typeof val.toCSS === 'function' || typeof val.css === 'function'
  )
}

export function getCSSVal(val) {
  return val.css ? val.css() : val.toCSS()
}

export function colorToString(color: Color) {
  if (typeof color === 'string') {
    return color
  }
  if (isCSSAble(color)) {
    return getCSSVal(color)
  }
  return objectToColor(color)
}
