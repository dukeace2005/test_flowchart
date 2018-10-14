import React, { Component } from 'react';

export const JVContext = React.createContext();

export class JVProvider extends Component {
  state = {
    exeResults: []
  }
  
  setResult = (result) => {
    let exeResults = this.state.exeResults;
    exeResults[result.id] = result.value;
    this.setState({exeResults: exeResults})
  }

 render() {
    return (
      <JVContext.Provider value={{
        ...this.state,
        setResult: this.setResult
        }}>
        {this.props.children}
      </JVContext.Provider>
    )
  }
}
