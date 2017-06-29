# gloss 💅

Really powerful CSS in JS. Statically analyzable styles that just work. Extremely flexible theming!

Combines a few things:

- [JSS](https://github.com/cssinjs/jss) styles
- [motion-css](https://github.com/motion/gloss/tree/master/packages/motion-css) for powerful JS syntax for styles
- Advanced theme engine
- Babel plugin to allow simpler $style props

## features
- super fast
- built on jss
  - auto prefixes
  - animations
  - pseudos
  - media queries
  - '> selectors', etc
- incredibly flexible (themes, styles, parent-styles)
- themes are far easier way to restyle multiple elements
- powerful js object-based styles

## install

```js
npm install --save gloss
```

gloss has a tiny transform that will allow it to lookup on your elements. this keeps it :lightning: fast.

```js
{
  "babel": {
    "plugins": [
      ["gloss/transform", { "decoratorName": "style" }]
    ]
  }
}
```

## usage

here's a pretty good base view you can build from:

```js
import React from 'react'
import ReactDOM from 'react-dom'
import gloss, { color as $, Theme, ThemeProvide } from '@mcro/gloss'
import type { Color } from '@mcro/gloss'
import Icon from './icon'
import Popover from './popover'

const LINE_HEIGHT = 30

const { decorator: style } = gloss({
  baseStyles: styles,
  themeProp: 'theme',
  tagName: 'tagName',
  isColor: color => color && !!color.rgb,
  processColor: color => color.toString(),
})

ReactDOM.render(
  <ThemeProvide bright={{ background: '#000' }}>
    <Theme name="bright">
      <Surface icon="name" />
    </Theme>
  </ThemeProvide>,
  document.querySelector('#app')
)

@style
export default class Surface {
  static defaultProps = {
    tagName: 'div',
    size: 1,
  }

  uniq = `icon-${Math.round(Math.random() * 1000000)}`

  render({
    inSegment,
    inForm,
    onClick,
    clickable,
    children,
    icon,
    iconProps,
    iconSize: _iconSize,
    iconAfter,
    iconColor,
    color,
    active,
    highlight,
    spaced,
    after,
    chromeless,
    inline,
    dim,
    stretch,
    tagName,
    tooltip,
    tooltipProps,
    background,
    className,
    theme: _theme,
    circular,
    size,
    borderRadius,
    material,
    padding,
    height,
    margin,
    hoverColor,
    wrapElement,
    elementStyles,
    getRef,
    noElement,
    flex,
    placeholderColor,
    borderColor,
    ...props
  }) {
    const { theme } = this
    const hasIconBefore = icon && !iconAfter
    const hasIconAfter = icon && iconAfter
    const stringIcon = typeof icon === 'string'
    const iconSize =
      _iconSize ||
      (theme && theme.element.style.fontSize * 0.9) ||
      Math.log(size + 1) * 15

    const finalClassName = `${this.uniq} ${className || ''}`
    const passProps = {
      className: finalClassName,
      onClick,
      tagName,
      ref: getRef,
      ...props,
    }

    return (
      <surface {...!wrapElement && passProps}>
        <icon if={icon && !stringIcon} $iconAfter={hasIconAfter}>
          {icon}
        </icon>
        <Icon
          if={icon && stringIcon}
          $icon
          $iconAfter={hasIconAfter}
          name={icon}
          size={iconSize}
          {...iconProps}
        />
        <element
          if={!noElement}
          {...wrapElement && passProps}
          $hasIconBefore={hasIconBefore}
          $hasIconAfter={hasIconAfter}
        >
          {children}
        </element>
        {after || null}
        <Popover
          if={tooltip}
          theme="dark"
          background
          openOnHover
          noHover
          animation="bounce 150ms"
          target={`.${this.uniq}`}
          padding={[0, 6]}
          distance={8}
          arrowSize={8}
          delay={100}
          popoverProps={{ $$style: { fontSize: 11 } }}
          {...tooltipProps}
        >
          {tooltip}
        </Popover>
      </surface>
    )
  }

  static style = {
    surface: {
      lineHeight: '1rem',
      fontWeight: 400,
      flexFlow: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: 'transparent',
      position: 'relative',
      boxShadow: ['inset 0 0.5px 0 rgba(255,255,255,0.2)'],
    },
    minimal: {
      boxShadow: 'none',
    },
    element: {
      border: 'none',
      background: 'transparent',
      userSelect: 'none',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    icon: {
      pointerEvents: 'none',
    },
    hasIconBefore: {
      marginLeft: '0.7vh',
    },
    hasIconAfter: {
      marginRight: '0.7vh',
    },
    iconAfter: {
      order: 3,
    },
  }

  surfaceStyle = {
    background: 'transparent',
    borderRightWidth: 1,
    borderLeftWidth: 1,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    margin: [-2, -3],
    maxHeight: '1.45rem',
    borderRadius: 1000,
  }

  disabledStyle = {
    opacity: 0.25,
    pointerEvents: 'none',
  }

  dimStyle = {
    opacity: 0.5,
    '&:hover': {
      opacity: 1,
    },
  }

  spacedStyles = {
    margin: [0, 5],
    borderRightWidth: 1,
  }

  static theme = (props, theme, self) => {
    // sizes
    const height = props.size * LINE_HEIGHT
    const width = props.width
    const padding =
      typeof props.padding !== 'undefined'
        ? props.padding
        : props.wrapElement ? 0 : [0, height / 4]
    const fontSize = props.fontSize || height * 0.5
    const flex = props.flex === true ? 1 : props.flex

    // radius
    const baseBorderRadius = props.borderRadius
      ? props.borderRadius
      : height / 5
    const borderRadius = props.circular
      ? height
      : baseBorderRadius || height / 10

    // colors
    const background =
      props.background || theme.base.background || 'transparent'
    const borderColor = props.borderColor || theme.base.borderColor
    const color = props.highlight
      ? props.highlightColor || theme.highlight.color || props.color
      : props.active ? theme.active.color : props.color || theme.base.color
    const hoverColor =
      (props.highlight && $(color).lighten(0.2)) ||
      props.hoverColor ||
      theme.hover.color ||
      (props.color && $(props.color).lighten(0.2))
    const iconColor = props.iconColor || color
    const iconHoverColor = props.iconHoverColor || hoverColor

    const segmentStyles = props.inSegment && {
      marginLeft: -1,
      borderLeftRadius: props.inSegment.first ? borderRadius : 0,
      borderRightRadius: props.inSegment.last ? borderRadius : 0,
    }
    const circularStyles = props.circular && {
      padding: 0,
      width: height,
      borderRadius: props.size * LINE_HEIGHT,
      overflow: 'hidden',
    }
    return {
      element: {
        ...props.elementStyles,
        fontSize,
        lineHeight: '1px',
        color,
        '&:hover': {
          color: hoverColor,
        },
      },
      surface: {
        height,
        width,
        flex,
        padding,
        borderRadius,
        borderColor,
        background,
        ...circularStyles,
        ...segmentStyles,
        ...(props.inline && self.surfaceStyle),
        ...(props.disabled && self.disabledStyle),
        ...(props.dim && self.dimStyle),
        ...(props.spaced && self.spacedStyle),
        ...(props.chromeless && {
          borderWidth: 0,
        }),
        '& > icon': {
          color: iconColor,
        },
        '&:hover > icon': {
          color: iconHoverColor,
        },
        '&:hover': {
          ...theme.hover,
        },
        // this is just onmousedown
        '&:active': {
          position: 'relative',
          zIndex: 1000,
        },
        // inForm
        ...(props.inForm && {
          '&:active': theme.active,
          '&:focus': theme.focus,
        }),
      },
    }
  }
}
```
