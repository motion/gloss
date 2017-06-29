// @flow
export default function({ types: t }: { types: Object }) {
  return {
    visitor: {
      Class(path: Object, state: Object) {
        const props = []
        const body = path.get('body')

        for (const path of body) {
          if (path.isClassProperty()) {
            console.log(path)
            props.push(path)
          }
        }
      },
    },
  }
}
