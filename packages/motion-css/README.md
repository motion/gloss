## motion-css

Turns objects into nice CSS styles. Has a few helpers:

- Arrays to strings:
```js
{
  border: [1, 'solid', '#eee'], // 1px solid #eee
  border: [1, '#eee'], // defaults (solid)
  color: [0, 0, 0, 0.5], // rgba(0,0,0,0.5)
}
```
- Transform objects:
```js
{
  transform: { x: 0, y: 10, z: 0, rotate: '100deg' }
}
```

- Color objects:
```js
{
  background: [0, 255, 0]
}
```

- Converts css-able functions/objects:
```js
{
  background: chroma('#fff') // will call .css() automatically
}
```

- Recurses into media queries + & selectors
```js
{
  '@media screen': { ... }
}
```

```js
{
  '& child': { ... }
}
```

- Shorthands
```js
{
  borderLeftRadius: ['borderTopLeftRadius', 'borderBottomLeftRadius'],
  borderRightRadius: ['borderTopRightRadius', 'borderBottomRightRadius'],
  borderBottomRadius: ['borderBottomLeftRadius', 'borderBottomRightRadius'],
  borderTopRadius: ['borderTopRightRadius', 'borderTopLeftRadius'],
}
```
- Comma separations for boxShadow and transition:
```js
{
  boxShadow: [{ x: 5, y: 5, blur: 2, spread: 5, color: [0,0,0,0.1] }, /* ... */]
}
```

- Object to value:
```js
{
  background: {
    color: 'green',
    image: 'url(image.jpg)',
    position: [0, 0],
    repeat: 'no-repeat'
  }
}
```
