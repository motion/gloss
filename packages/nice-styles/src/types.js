/* @flow */

type NoS = number | string

export type NiceColor = string | [NoS, NoS, NoS] | [NoS, NoS, NoS, NoS] | {
  r: NoS,
  g: NoS,
  b: NoS,
} | {
  r: NoS,
  g: NoS,
  b: NoS,
  b: NoS,
}

export type ColorObject = {
  toCSS?: (() => string),
  css?: (() => string),
}

export type Color = ColorObject | NiceColor

export type Transform = {
  x: number | string,
  y: number | string,
  z: number | string,
}
