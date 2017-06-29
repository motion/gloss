import React from 'react'
import { string } from 'prop-types'

export default class Theme extends React.Component {
  static childContextTypes = {
    uiActiveTheme: string,
  }

  getChildContext() {
    return {
      uiActiveTheme: this.props.name,
    }
  }

  render() {
    return React.Children.only(this.props.children)
  }
}
