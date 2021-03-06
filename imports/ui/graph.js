import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import joint from 'jointjs'
import GraphViewer from './GraphViewer'
import JsonViewer from './JsonViewer'
import { Cells } from '../api/cells.js';
import { withTracker } from 'meteor/react-meteor-data';
import _ from 'lodash';


class GraphEditor extends Component {

  constructor(props) {
    super(props);

    this.state = { graphIsInitialized: false }

    this.onGraphAdd = this.onGraphAdd.bind(this);
    this.onGraphChange = this.onGraphChange.bind(this);
    this.onGraphRemove = this.onGraphRemove.bind(this);
    this.handleAddRectangle = this.handleAddRectangle.bind(this);
    this.handleAddCircle = this.handleAddCircle.bind(this);
    this.addToCellToGraph = this.addToCellToGraph.bind(this);
    this.loadGraphDataFromDb = this.loadGraphDataFromDb.bind(this);
    this.renderGraph = this.renderGraph.bind(this);

    this.graph = new joint.dia.Graph();
    this.graph.on('all', function(eventName, cell) {
      console.log(arguments);
      console.log(eventName);
      console.log(cell);
    });
    this.graph.on('add', this.onGraphAdd);
    this.graph.on('change', this.onGraphChange);
    this.graph.on('remove', this.onGraphRemove);

    this.paper = new joint.dia.Paper({
      el: document.getElementById('paper'),
      width: 800,
      height: 400,
      gridSize: 1,
      model: graph,
      snapLinks: true,
      linkPinning: false,
      embeddingMode: true,
      highlighting: {
          'default': {
              name: 'stroke',
              options: {
                  padding: 6
              }
          },
          'embedding': {
              name: 'addClass',
              options: {
                  className: 'highlighted-parent'
              }
          }
      },
  
      validateEmbedding: function(childView, parentView) {
  
          return parentView.model instanceof joint.shapes.devs.Coupled;
      },
  
      validateConnection: function(sourceView, sourceMagnet, targetView, targetMagnet) {
  
          return sourceMagnet != targetMagnet;
      }
    });
  }

  onGraphAdd(cell) {
    console.log(`onGraphAdd cell: ${JSON.stringify(cell.toJSON(), null, 2)}`);
    this.props.insertCellInDb(cell.toJSON());
  }

  onGraphChange(cell) {
    console.log(`onGraphChange cell: ${JSON.stringify(cell.toJSON(), null, 2)}`);
    this.props.updateCellInDb(cell.toJSON());
  }

  onGraphRemove(cell) {
    console.log(`onGraphRemove cell: ${JSON.stringify(cell.toJSON(), null, 2)}`);
    this.props.removeCellInDb(cell.toJSON());
  }

  createRectangle() {
    return new joint.shapes.basic.Rect({
      position: { x: 100, y: 30 },
      size: { width: 100, height: 30 },
      attrs: {
        rect: { fill: 'blue' },
        text: { text: 'RECTANGLE', fill: 'white' }
      },
      inPorts: ['in1'],
      outPorts: ['out1']
    });
  }

  createCricle() {
    return new joint.shapes.basic.Circle({
      position: { x: 100, y: 30 },
      size: { width: 100, height: 100 },
      attrs: {
        circle: { fill: 'green' },
        text: { text: 'Res', fill: 'white' }
      }
    });
  }

  createLink(from, to) {
    return new joint.dia.Link({
      source: { id: from },
      target: { id: to }
    });
  }

  addToCellToGraph(a) {
    this.graph.addCell(a);
  }

  handleAddRectangle() {
    this.addToCellToGraph(this.createRectangle());
  }

  handleAddCircle() {
    this.addToCellToGraph(this.createCricle());
  }

  loadGraphDataFromDb() {
    this.graph.fromJSON({ cells: this.props.dbCells });
    this.setState({ graphIsInitialized: true });
  }



  renderButtons() {
    return (<div>
      <button onClick={this.handleAddRectangle}>Add rectangle</button>
      <button onClick={this.handleAddCircle}>Add circle</button>
      <button onClick={this.loadGraphDataFromDb}>Reset to DB</button>
    </div>)
  }

  render() {
    let buttonRow = null;
    if (!this.props.dbCellsIsLoaded) {
      buttonRow = (<h1>Loading ...</h1>);
    } else if (!this.state.graphIsInitialized) {
      buttonRow = (<button onClick={this.loadGraphDataFromDb}>Click here load the graph from the db</button>);
    } else buttonRow = this.renderButtons();

    return (
      <div>
        {buttonRow}
        {this.props.dbCells ? this.renderGraph() : <div>There is no Graph in the DB. Please create one via the Button</div>}
      </div >
    )
  }

  renderGraph() {
    return (<div>
      <GraphViewer graph={this.graph} />
    </div>)
  }
}


export default withTracker(() => {
  const insertCellInDb = (cellJson) => {
    Meteor.call("cells.insert", cellJson);
  }

  const removeCellInDb = (cellJson) => {
    Meteor.call("cells.remove", cellJson._id);
  }

  const updateCellInDb = (cellJson) => {
    console.log('updateCellInDb');
    Meteor.call("cells.update", cellJson);
  }
  const debounceWaitMs = 300;
  const updateCellInDbDebounced = _.debounce(updateCellInDb, debounceWaitMs);

  const cellsSubscribeTracker = Meteor.subscribe('cells');
  const dbCellsIsLoaded = cellsSubscribeTracker.ready();
  const dbCells = Cells.find({}).fetch();

  return {
    updateCellInDb: updateCellInDbDebounced,
    removeCellInDb,
    insertCellInDb,
    dbCells,
    dbCellsIsLoaded
  };
})(GraphEditor);

