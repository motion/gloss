// @flow

import helper from 'babel-helper-builder-react-jsx'

export default function({ types: t }: { types: Object }) {
  // convert React.createElement() => this.glossElement()

  const classBodyVisitor = {
    ClassMethod(path: Object, state: Object) {
      const GLOSS_ID = path.scope.generateUidIdentifier('gloss')
      let hasJSX = false

      const { JSXNamespacedName, JSXElement } = helper({
        post(state) {
          // need path to determine if variable or tag
          const stupidIsTag =
            state.tagName && state.tagName[0].toLowerCase() === state.tagName[0]

          state.call = t.callExpression(GLOSS_ID, [
            stupidIsTag ? t.stringLiteral(state.tagName) : state.tagExpr,
            ...state.args,
          ])
        },
      })

      path.traverse(
        {
          JSXNamespacedName,
          JSXElement: {
            enter() {
              hasJSX = true
            },
            exit: JSXElement.exit,
          },
        },
        state
      )

      if (hasJSX) {
        // add a fancyelement hook to start of render
        path.node.body.body.unshift(
          t.variableDeclaration('const', [
            t.variableDeclarator(GLOSS_ID, t.identifier('this.glossElement')),
          ])
        )
      }
    },
  }

  return {
    visitor: {
      ClassExpression(path: Object, state: Object) {
        const node = path.node
        if (!node.decorators || !node.decorators.length) {
          return
        }

        // -- Validate if class is what we're looking for
        //    has some flexibility, looks for any of:
        //       @x  @x()  @x.y  @x.y()

        const decoratorName =
          (state.opts && state.opts.decoratorName) || 'style'

        const foundDecorator = node.decorators.some(item => {
          if (!item.expression) {
            return false
          }
          // @style
          if (
            item.expression.type === 'Identifier' &&
            item.expression.name === decoratorName
          ) {
            return true
          }
          // @style()
          if (
            item.expression.callee &&
            item.expression.callee.name === decoratorName
          ) {
            return true
          }
          // @style.something()
          if (
            item.expression.callee &&
            t.isMemberExpression(item.expression.callee) &&
            item.expression.callee.object.name === decoratorName
          ) {
            return true
          }
          // @style.something
          if (
            item.expression.object &&
            item.expression.object.name === decoratorName
          ) {
            return true
          }

          return false
        })

        // -- Add a unique var to scope and all of JSX elements
        if (foundDecorator) {
          path.traverse(classBodyVisitor, state)
        }
      },
    },
  }
}
