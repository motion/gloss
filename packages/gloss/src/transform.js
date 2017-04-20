/* @flow */

export default function({ types: t }: { types: Object }) {
  const classBodyVisitor = {
    ClassMethod(path: Object) {
      if (path.node.key.name === 'render') {
        // add a fancyelement hook to start of render
        path.node.body.body.unshift(
          t.expressionStatement(
            t.assignmentExpression(
              '=',
              t.memberExpression(
                t.identifier('React'),
                t.identifier('createElement')
              ),
              t.identifier('this.fancyElement.bind(this)')
            )
          )
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
