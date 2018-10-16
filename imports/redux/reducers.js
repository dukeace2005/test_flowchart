    const initialState = {
        outputs: [],
        units: [],
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
        case 'ADD_UNIT':
        return Object.assign({}, state, {
            units: [
                ...state.units,
                    {
                    id: action.unit.id,
                    }
                ]
            })
        case 'REMOVE_UNIT':
            const new_units = state.units.filter(unit => { 
                return (unit.id != action.unit.id)
            });
            const new_outputs = state.outputs.filter((output) => {
                if(output.id == action.unit.id) {
                    output.completed = true;
                }
                return output;
            })
        return Object.assign({}, state, {
            units: new_units,
            outputs: new_outputs,
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