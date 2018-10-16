export const addOutput = (output) => {  
    return {
        type: 'ADD_OUTPUT',
        output: {
            id: output.id,
            value: output.value,
            completed: output.completed
        }
    }
  }

  export const cleanOutputs = () => {  
    return {
        type: 'CLEAN_OUTPUTS',
    }
  }

  export const addUnit = (unit) => {
    return {
        type: 'ADD_UNIT',
        unit: unit
    }      
  }

  export const removeUnit = (id) => {
    return {
        type: 'REMOVE_UNIT',
        unit: id,
    }      
  }

export const completeOutput = () => {  
    return function(dispatch, getState) {
        const completed = getState().isCompleted;
        return dispatch(markComplete(!completed));
    }
  }