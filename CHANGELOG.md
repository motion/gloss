# Changelog

## 6.1.0

- `<Theme />` and `<ThemeProvide />` join with themes to allow passing themes through context and setting them for sub-trees.

## 6.0.0

- there was a large backslide bug in 5 when we moved to JSS where passing down styles to a sub-component wouldn't guarantee they would be applied in the right order. This has been fixed by not passing className but instead passing a plain style object that's been processed through gloss. The API is entirely unchanged, but now they should apply properly. Downside may include slight performance hit as it requires passing around and applying styles inline. Upside is that it works properly!
- style props now can be glossed, just add gloss: true to your style object:

```js
<div style={{ gloss: true, background: 'blue', '&:hover': { background: 'red } }} />
```

## 5.2.0

- Simple components now can attach ref with `getRef` property.

## 5.0.0

- Move to JSS! Using [Aphrodisiac](https://github.com/cssinjs/aphrodisiac)
- Remove pseudo pseudonyms (uses JSS style now: `hover` => `'&:hover'`)
