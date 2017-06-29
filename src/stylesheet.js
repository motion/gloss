import aphrodite from 'aphrodite-jss'
import preset from 'jss-preset-default'
import { create } from 'jss'

export const { css, StyleSheet } = aphrodite(create(preset()))
