# gloss 💅

Really powerful CSS in JS. Statically analyzable styles that just work. Extremely flexible theming!

Combines a few things:

- [JSS](https://github.com/cssinjs/jss) styles
- [motion-css](https://github.com/motion/gloss/tree/master/packages/motion-css) for powerful JS syntax for styles
- Advanced theme engine
- Babel plugin to allow simpler $style props

## features
- small library, relies on other small libraries
- auto prefixes
- supports pseudos
- supports media queries
- themes are far easier way to restyle multiple elements
- powerful js object-based styles
- dynamic and static styles
- keeps html easy to read

## install

```js
npm install --save gloss
```

To use the gloss decorator, add this to your babel config:

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
Gloss must first be instantiated, and supports two options:

```js
import gloss from 'gloss'

export const style = gloss({
  // when on, slightly faster performance but no theme support
  dontTheme: false,
  // optional object with base styles that are accessible using $$props
  baseStyles: {
    fullscreen: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    }
  }
})

// to use later in app:
// import { style } from './path/to/glossSetup'
```

For more information on how to write styles, see:

- shorthands: [motion-css](https://github.com/motion/gloss/tree/master/packages/nice-styles)
- syntax: [JSS](https://github.com/cssinjs/jss)

## examples

```js
import $ from './gloss'

export const Title = $('h1', {
  border: [1, '#eee'],
  background: 'azure',
  fontSize: 22
})

export const Page = $('section', (props) => ({
  padding: 20,
  background: props.background,
}))
```

A small view using the decorator:

```js
import style from './gloss'

@style class extends Component {
  render() {
    return <h1 $black $bg="#fff">Test</h1>
  }

  static style = {
    h1: {
      fontSize: 22,
      color: [255, 255, 255],
      '&:hover': { color: 'red', },
      borderBottom: [2, 'solid yellow']
    },
    black: {
      color: 'black',
    },
    bg: color => ({
      background: color,
      borderBottom: [2, 'solid', color]
    })
  }
}
```

## themes

Use themes for really easy variant looks for components. Gives you complete control to
change multiple elements with a single prop.

```js
import style from './gloss'

@style class Title extends React.Component {
  render() {
    return (
      <base>
        <h1>Test</h1>
      </base>
    )
  }

  static style = {
    base: {
      padding: 10,
      transform: {
        rotate: '45deg',
      },
      filter: {
        grayscale: 0,
      }
    },
    h1: {
      fontSize: 22,
    }
  }

  static theme = {
    big: {
      base: {
        padding: 20,
      },
      h1: {
        fontSize: 50,
      }
    },
    tint: props => ({
      base: {
        background: [props.color, 0.5],
      },
      h1: {
        color: props.color,
      }
    })
  }
}

// Use
React.render(<Title big tint="yellow" />, document.getElementById('app'))
```

### differences between style and theme:

- Theme requires a further nesting of objects, to specify which tag to target for each style
- Theme passes in all props if you specify a function! This gives more power to use any prop to affect the styling within a given specific theme property.

## base styles

Helpful for maintaining a common set of styles for every component. Using `$$` to access keeps things explicit.

```js
import gloss from 'gloss'

const style = gloss({
  baseStyles: {
    row: {
      flexFlow: 'row',
    },
  },
})

@style
class extends React.Component {
  render() {
    return (
      <div $$row>
        <h1>Test1</h1>
        <h1>Test2</h1>
      </div>
    )
  }

  static style = {
    div: {
      background: 'yellow',
    },
  }
}
```

## glossy style props

Gloss now supports optionally handling your style props. This is born out of how it passes styles down to children components, but allows your to handle this yourself. In the future, there may be a way to enable this automatically, or to define a specific alternate prop (like `css`) that automatically glossifies styles.

```js
@style
class extends React.Component {
  render() {
    return (
      <div style={{ gloss: true, background: 'red', '&:hover': { background: 'yellow' } }}>
        <h1>Test1</h1>
        <h1>Test2</h1>
      </div>
    )
  }
}
```

## more examples

### shim React.createElement for styles for any element

 Basically allows your to access `$$prop` type styles anywhere:

```js
// before you render anything in react:
import Gloss from './mygloss'
import React from 'react'
import ReactDOM from 'react-dom'

React.createElement = Gloss.createElement

// now you can access parent styles here:
ReactDOM.render(
  <sometag $$flashy />,
  document.querySelector('#app')
)
```

### advanced themes for sub-trees

```js
import style from './mygloss'
import { ThemeProvide, Theme } from 'gloss'

const Root = () =>
  <ThemeProvide dark={{ background: 'black' }}>
    <Parent>
      <Child big />
    </Parent>
  </ThemeProvide>

const Parent = (props) =>
  <Theme name="dark">
    {props.children}
  </Theme>

@style
class Child {
  render() {
    return <child />
  }

  static theme = {
    big: (props, context, activeTheme) => ({
      background: activeTheme.background,
    })
  }
}
```

### make ui components that take props as styles

```js
import gloss from 'gloss'

// import this usually from ./gloss.js
const style = gloss({
  baseStyles: {
    red: {
      background: 'red',
    },
    style: obj => obj,
  }
})

@style
export default class Section {
  static defaultProps = {
    maxHeight: 'auto',
    minHeight: 800,
    background: colors.primary,
    height: 'auto',
    color: '#444',
    position: 'relative',
    overflow: 'hidden',
    padding: [90, 0],
    [media.small]: {
      padding: [50, 0],
    },
  }

  render() {
    const { children, windowHeight, maxHeight, minHeight, attach, ...props } = this.props

    if (windowHeight) {
      props.height = Math.max(minHeight, Math.min(maxHeight, window.innerHeight))
    }

    return (
      <section $$style={props} $$red {...attach}>
        {children}
      </section>
    )
  }

  static theme = {
    centered: {
      section: {
        justifyContent: 'center',
      },
    },
  }
}
```

## contributing

After cloning this repo, run `npm run bootstrap`. You can then link it into your app `npm link gloss` and test changes.
