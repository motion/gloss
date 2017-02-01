import aphrodisiac from 'aphrodisiac'
import preset from 'jss-preset-default'
import { create } from 'jss'

export const { css, StyleSheet } = aphrodisiac(create(preset()))
