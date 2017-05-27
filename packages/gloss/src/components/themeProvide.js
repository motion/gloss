import React from 'react'
import { object } from 'prop-types'

export default class ThemeProvide extends React.Component {
  static childContextTypes = {
    uiTheme: object,
  }

  getChildContext() {
    return {
      uiTheme: this.props,
    }
  }

  render() {
    return this.props.children
  }
}
