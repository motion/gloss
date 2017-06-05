# Changelog

## 6.5.0

- Change behavior: themeKey is applied first, allowing overriding themes within components


## 6.4.0

- Add Gloss.createElement so you can access parent styles anywhere.

## 6.3.0

- Big bugfix: gloss now properly will style children that are wrapped in functions. This changes how the babel transform works, which will unfortunately break any other JSX plugins you have. Working on a fix for this, if you need a special JSX plugin, please stay on 6.2.0.

## 6.2.0

- `<Theme />` and `<ThemeProvide />` join with themes to allow passing themes through context and setting them for sub-trees.

## 6.1.0

- Themes with context (undocumented)

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
