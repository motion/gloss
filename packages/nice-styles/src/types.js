// @flow

type NoS = number | string

export type NiceColor = string
  | CSSArray
  | { r: NoS, g: NoS, b: NoS, a?: NoS }

export type ToCSSAble =
  { toCSS: Function }
  | { css: Function }

export type Color = ToCSSAble | NiceColor

export type Transform = {
  x: number | string,
  y: number | string,
  z: number | string,
}

export type CSSArray = Array<number>
