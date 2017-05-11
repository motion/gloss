## motion-css

Turns objects into nice CSS styles. Has a few helpers:

- Arrays to strings:
  ```
    border: [1, 'solid', '#eee']
    border: [1, #eee'] // auto adds solid
    color: [0, 0, 0, 0.5]
  ```
- Transform objects:
  `transform: { x: 0, y: 10 }`
- Color objects:
  `background: [0, 255, 0]`
- Converts css-able functions/objects:
  `background: chroma('#fff') // will call .css() automatically`
- Recurses into media queries + & selectors
  `'@media screen': { ... }`
  `'& child': { ... }`
- Shorthands
  ```
  {
    borderLeftRadius: ['borderTopLeftRadius', 'borderBottomLeftRadius'],
    borderRightRadius: ['borderTopRightRadius', 'borderBottomRightRadius'],
    borderBottomRadius: ['borderBottomLeftRadius', 'borderBottomRightRadius'],
    borderTopRadius: ['borderTopRightRadius', 'borderTopLeftRadius'],
  }
  ```
