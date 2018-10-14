    const initialState = {
        outputs: [],
    };
  
    const recorder = (state = initialState, action) => {
    switch (action.type) {
      case 'ADD_OUTPUT':
          return Object.assign({}, state, {
            outputs: [
                ...state.outputs,
                    {
                    id: action.output.id,
                    value: action.output.value,
                    completed: action.output.completed
                    }
                ]
            })
            case 'CLEAN_OUTPUTS':
            return Object.assign({}, state, {
              outputs: []
              })
          case 'COMPLETE_OUTPUT':
            return Object.assign({}, state, {
                outputs: state.outputs.map((output, index) => {
                if (output.id == action.id) {
                    return Object.assign({}, output, {
                    completed: true,
                    value: action.value
                    })
                }
                return output
                })
            })
        default:
            return state
    }
  }

  export default recorder