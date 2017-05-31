import React from 'react'
import { object } from 'prop-types'

export default class ThemeProvide extends React.Component {
  static childContextTypes = {
    uiTheme: object,
    provided: object,
  }

  getChildContext() {
    return {
      uiTheme: this.props,
      provided: {},
    }
  }

  render() {
    return this.props.children
  }
}
