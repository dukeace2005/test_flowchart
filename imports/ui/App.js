import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import GraphTracker from '../graph/graphTracker';
import GraphEditor from './GraphEditor';
import JsonViewer from './JsonViewer';
import GraphViewer from './GraphViewer';
import { Cells } from '../api/cells.js';
import joint, { util } from 'jointjs'
import { Position, Toaster, Intent } from "@blueprintjs/core";
import "@blueprintjs/core/lib/css/blueprint.css";
import { connect } from 'react-redux';
import { addOutput, cleanOutputs } from '../redux/actions';

const template = {
  "_id": util.uuid(),
  "createdAt": new Date().toISOString(),
  "updatedAt": new Date().toISOString(),
  "units": [
  ]
}

//const store = createStore(recorder);

// App component - represents the whole app
class App extends Component {
  constructor(props) {
    super(props);

    this.graph = new joint.dia.Graph();
    this.graphTracker = new GraphTracker(this.graph);
    this.state = { 
      graphWasLoadedFromDb: false,
      workflow: template,
      selCell: null,
      refresh: false,
    };
    this.onAddUnit = this.onAddUnit.bind(this);
    this.onKeyPressed = this.onKeyPressed.bind(this);
    this.onEditUnit = this.onEditUnit.bind(this);
    this.onSelectOption = this.onSelectOption.bind(this);
    this.onSelectWorflow = this.onSelectWorflow.bind(this);
    this.onEditWorkflow = this.onEditWorkflow.bind(this);
    this.onGraphRefresh = this.onGraphRefresh.bind(this);

    let self = this;
    //New Unit has been dropped into space
    this.graph.on('add', (event, cell) => {
      self.onAddUnit(event);
    });
  }

  //Unregister keyboard listener
  componentWillUnmount(){
    document.removeEventListener("keydown", this.onKeyPressed, false);
  }

  //Register keyboard listener
  componentDidMount() {
    document.addEventListener("keydown", this.onKeyPressed, false);

    let self = this;
    //Create view for graph editor
    this.paper = new joint.dia.Paper({
      el: self.arena,
      width: '100%',
      height: 400,
      gridSize: 10,
      model: this.graph
  });

  //Deselect all units
  this.paper.on('blank:pointerup', (evt, x, y) => { 
    self.graph.getElements().map(cell => {
      var cellView = self.paper.findViewByModel(cell);
      cellView.unhighlight();
    });
    self.setState({
      selCell: null
    });
  })

  //Select clicked unit
  this.paper.on('cell:pointerclick', (cellView) => {
    self.graph.getElements().map(cell => {
      var view = self.paper.findViewByModel(cell);
      if(view == cellView) {
        self.state.selCell = cell;
      }
      view.unhighlight();
    });
    cellView.highlight();
    self.setState({
      refresh: !self.state.refresh
      });
    });

    
  }

  //Key pressed, check for Delete
  onKeyPressed(event) {
    if(event.keyCode == 46 && this.state.selCell) {
      this.graph.removeCells([this.state.selCell]);
    }
  }

  //onGraphRefresh - refresh JSON viewer for the entire workflow
  onGraphRefresh() {
    this.props.cleanOutputs();
    var cells = this.graph.getCells();
    var value = 'N/A';
    cells.map(cell => {
      var desc = cell.prop('desc');//Contains ports with their values
      var guts = cell.prop('guts');//Contains ports with their values
      if(guts == null)
        return;
      if(guts.type == 'conditional') {
        value = desc.ports['yes'].value;
      }
      else {
        value = desc.ports['out'].value;
      }

      this.props.addOutput({
        id: cell.id,
        value: value,
        completed: desc.completed || false
    });
  });

    this.setState({
      refresh: !this.state.refresh
    });
  }

  //Callback from JSON Viewer for Unit configuration
  onEditUnit(edit) {
    if(this.state.selCell) {
      this.state.selCell.prop('desc', edit.updated_src);
    }

    this.setState({
      refresh: !this.state.refresh      
    });

    return true;
  }

  //Callback from JSON Viewer to change cond.engine
  onSelectOption(edit) {
    if(this.state.selCell) {
      var guts = this.state.selCell.prop('guts');
      if(guts.type != "conditional") 
        return;
      var updated_desc = this.state.selCell.prop('desc');
      updated_desc.value = edit;
      this.state.selCell.prop('desc', updated_desc);
      var label = 'Cond.';
      switch(updated_desc.value) {
        case 'equal':
          label = '==';
        break;
        case 'not equal':
          label = '!=';
        break;
        case 'greaterThanInclusive':
          label = '>=';
        break;
        case 'lessThanInclusive':
          label = '<=';
        break;
        case 'greaterThanExclusive':
          label = '>';
        break;
        case 'lessThanExclusive':
          label = '<';
        break;
      }
      this.state.selCell.attr('.label/text', label);
    }

    this.setState({
      refresh: !this.state.refresh      
    });

    return true;
  }

  //Callback from JSON Viewer of workflow
  onSelectWorflow(edit) {
    console.log(edit);

    this.setState({
      refresh: !this.state.refresh      
    });

    return true;
  }

  //Callback from JSON Viewer for Workflow configuration
  onEditWorkflow(edit) {
    console.log(edit);

    return true;
  }

  //Add unit to workflow
  onAddUnit(cell) {
    if(cell.attributes.type != 'devs.Model') {
      return;
    }
    var workflow = this.state.workflow;
    workflow.updatedAt = new Date().toISOString();
    workflow.units.push(cell.prop('desc'));

    //Refresh json view
    this.setState({
      workflow: workflow,
    });

    /*Toaster.create({
      position: Position.BOTTOM,
    }).show({
      intent: Intent.WARNING,
      timeout: 5000,
      message: "Click inside the cell to select"
      });*/
  }

  render() {
    let desc = {};
    let guts = {};
    if(this.state.selCell) {
      desc = this.state.selCell.prop('desc');
      guts = this.state.selCell.prop('guts');
    }

    let top_display = (
      <tr> 
        <td>
          <GraphEditor graph={this.graph} callback={this.onGraphRefresh} store={this.props}/>
        </td>
        <td>
          <div className='control-panel'>
                    <JsonViewer json={desc} name='Unit' theme='isotope' editCallback={this.onEditUnit} 
                      selectCallback={this.onSelectOption}/>
          </div>
        </td>
        <td>
          <div className='control-panel'>
            <JsonViewer json={this.graph.toJSON()} name='Workflow' theme="isotope" editCallback={this.onEditWorkflow} selectCallback={this.onSelectWorflow}/>
          </div>
        </td>
        <td>
            <div className='control-panel'>
              <JsonViewer json={JSON.parse(JSON.stringify(this.props.outputs))} name='Outputs' theme="isotope"/>
            </div>
          </td>
      </tr> 
    );
    let bottom_display = (
      <div ref={elem => this.arena = elem}>
      </div>
  );

    return(
      <div>
        {top_display}
        {bottom_display}
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    addOutput : (output) => dispatch(addOutput(output)),
    cleanOutputs : () => dispatch(cleanOutputs()),
  }
};

const mapStateToProps = (state) => {
  return {
      outputs: state.outputs,
      state: state
  }
};

/*export default withTracker(() => {
  //const cellsSubscribeTracker = Meteor.subscribe('cells');
  //const dbCellsIsLoaded = cellsSubscribeTracker.ready();
  //const dbCells = Cells.find({}).fetch();

  return {
    //dbCells,
    //dbCellsIsLoaded
  };
})(App);
*/
export default connect(  
  mapStateToProps,
  mapDispatchToProps
)(App);