// @flow
import { objectToColor, isCSSAble, getCSSVal } from './helpers'
import type { Transform } from './types'

// exports
export type { Transform, Color } from './types'
export * from './helpers'

const COLOR_KEYS = new Set(['background', 'color', 'backgroundColor'])
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

const NULL_VALUES = {}

const FALSE_VALUES = {
  background: 'transparent',
  backgroundColor: 'transparent',
  borderColor: 'transparent',
}

const COMMA_SEPARATABLE = {
  boxShadow: true,
  transition: true,
}

const px = (x: number | string) => (/px$/.test(`${x}`) ? thing : `${thing}px`)

const OBJECT_TRANSFORM = {
  boxShadow: ({ x, y, blur, spread, color }) =>
    `${px(x)} ${px(y)} ${px(blur)} ${px(spread)} ${objectToColor(color)}`,
  background: ({ color, image, position, repeat = 'no-repeat' }) =>
    `${objectToColor(color)} ${image} ${position.join(' ')} ${repeat}`,
}

function isFloat(n) {
  return n === +n && n !== (n | 0)
}

function processArrayItem(style: any) {
  // recurse
  if (Array.isArray(style)) {
    return objectToColor(style)
  }
  // toCSS support
  if (typeof style === 'object' && isCSSAble(style)) {
    return getCSSVal(style)
  }
  return typeof style === 'number' ? `${style}px` : style
}

function processArray(key: string, array: Array<number | string>): string {
  // solid default option for borders
  if (key.indexOf('border') === 0 && array.length === 2) {
    array.push('solid')
  }
  return array.map(processArrayItem).join(COMMA_SEPARATABLE[key] ? ',' : ' ')
}

function objectValue(key, value) {
  if (OBJECT_TRANSFORM[key]) {
    return OBJECT_TRANSFORM[key](value)
  }
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
  errorMessage: string = ''
): Object {
  const toReturn = {}
  for (let key in styles) {
    if (!styles.hasOwnProperty(key)) {
      continue
    }

    let value = styles[key]
    let valueType = typeof value

    // get real values
    // if (valueType === 'function') {
    //   value = value()
    //   valueType = typeof value
    // }
    if (valueType === false) {
      value === FALSE_VALUES[key]
      valueType = typeof value
    }

    // simple syles
    if (valueType === 'undefined' || value === null || value === false) {
      continue
    }

    let respond

    if (valueType === 'string' || valueType === 'number') {
      toReturn[key] = value
      respond = true
    }
    // complex styles
    if (isCSSAble(value)) {
      toReturn[key] = getCSSVal(value)
      respond = true
    }
    if (COLOR_KEYS.has(key) || key.toLowerCase().indexOf('color') !== -1) {
      toReturn[key] = objectToColor(value)
      respond = true
    }

    // shorthands
    if (SHORTHANDS[key]) {
      key = SHORTHANDS[key]
      if (Array.isArray(key)) {
        for (const k of key) {
          toReturn[k] = value
        }
      }
    }

    if (respond) {
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
      `${errorMessage}: Invalid style value for ${key}: ${JSON.stringify(
        value
      )}`
    )
  }

  return toReturn
}
