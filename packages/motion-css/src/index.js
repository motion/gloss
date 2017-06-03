// @flow
import { objectToColor, isCSSAble, getCSSVal } from './helpers'
import type { Transform } from './types'

// exports
export type { Transform, Color } from './types'
export * from './helpers'

const COLOR_KEYS = new Set(['background'])
const TRANSFORM_KEYS_MAP = {
  x: 'translateX',
  y: 'translateY',
  z: 'translateZ',
  dropShadow: 'drop-shadow',
}

const SHORTHANDS = {
  borderLeftRadius: ['borderTopLeftRadius', 'borderBottomLeftRadius'],
  borderRightRadius: ['borderTopRightRadius', 'borderBottomRightRadius'],
  borderBottomRadius: ['borderBottomLeftRadius', 'borderBottomRightRadius'],
  borderTopRadius: ['borderTopRightRadius', 'borderTopLeftRadius'],
}

function isFloat(n) {
  return n === +n && n !== (n | 0)
}

function processArray(key: string, array: Array<number | string>): string {
  // solid default option for borders
  if (key.indexOf('border') === 0 && array.length === 2) {
    array.push('solid')
  }

  return array
    .map(style => {
      // recurse
      if (Array.isArray(style)) {
        return objectToColor(style)
      }
      // toCSS support
      if (typeof style === 'object' && isCSSAble(style)) {
        return getCSSVal(style)
      }
      return typeof style === 'number' ? `${style}px` : style
    })
    .join(' ')
}

function objectValue(key, value) {
  if (isFloat(value)) {
    return value
  }

  if (key === 'scale' || key === 'grayscale' || key === 'brightness') {
    return value
  }

  if (typeof value === 'number') {
    return `${value}px`
  }

  if (Array.isArray(value)) {
    return processArray(key, value)
  }

  return value
}

function processObject(transform: Transform): string {
  const toReturn = []
  for (const key in transform) {
    if (!transform.hasOwnProperty(key)) {
      continue
    }
    let value = transform[key]
    value = objectValue(key, value)
    toReturn.push(`${TRANSFORM_KEYS_MAP[key] || key}(${value})`)
  }
  return toReturn.join(' ')
}

export default function processStyles(
  styles: Object,
  includeEmpty: boolean = false,
  errorMessage: string = ''
): Object {
  const toReturn = {}
  for (let key in styles) {
    if (!styles.hasOwnProperty(key)) {
      continue
    }

    const value = styles[key]
    const valueType = typeof value

    // shorthands
    if (SHORTHANDS[key]) {
      key = SHORTHANDS[key]

      // expand into multiple
      if (Array.isArray(key)) {
        for (const k of key) {
          toReturn[k] = value
        }
        continue
      }
    }
    if ((valueType === 'undefined' || value === null) && !includeEmpty) {
      continue
    }
    if (valueType === 'string' || valueType === 'number') {
      toReturn[key] = value
      continue
    }
    if (isCSSAble(value)) {
      toReturn[key] = getCSSVal(value)
      continue
    }
    if (COLOR_KEYS.has(key) || key.toLowerCase().indexOf('color') !== -1) {
      toReturn[key] = objectToColor(value)
      continue
    }

    // recurse into object (psuedo or media query)
    // before object processing
    const firstChar = key.substr(0, 1)

    if (firstChar === '@' || firstChar === '&') {
      toReturn[key] = processStyles(value)
      continue
    }

    // objects
    if (Array.isArray(value)) {
      toReturn[key] = processArray(key, value)
      continue
    } else if (valueType === 'object') {
      toReturn[key] = processObject(value)
      continue
    }

    throw new Error(
      `${errorMessage}: Invalid style value for ${key}: ${JSON.stringify(value)}`
    )
  }
  return toReturn
}
