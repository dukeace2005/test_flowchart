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

  export const markComplete = (completed) => {
    return {
        type: 'MARK_COMPLETE',
        output: {
            id: 1,
            value: 0,
            completed: completed
        }
    }      
  }

export const completeOutput = () => {  
    return function(dispatch, getState) {
        const completed = getState().isCompleted;
        return dispatch(markComplete(!completed));
    }
  }