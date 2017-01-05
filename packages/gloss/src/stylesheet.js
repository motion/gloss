import aphrodisiac from 'aphrodisiac'
import preset from 'jss-preset-default'
import { create } from 'jss'

const Aphrodisiac = aphrodisiac(create(preset()))

export const StyleSheet = Aphrodisiac.StyleSheet
export const css = Aphrodisiac.css
