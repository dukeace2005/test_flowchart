import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import joint from 'jointjs'
import GraphViewer from './GraphViewer'
import JsonViewer from './JsonViewer'
import Shapes from '../graph/shapes';
import { withTracker } from 'meteor/react-meteor-data';
import _ from 'lodash';
import { Toaster, Intent, Button, ButtonGroup, Popover, Position, Menu, MenuItem, MenuDivider } from "@blueprintjs/core";
import "@blueprintjs/core/lib/css/blueprint.css";
import Engine from 'json-rules-engine-simplified';
import SampleWorflow from '../../client/sample.json';
import SampleWorflow2 from '../../client/sample2.json';
import { connect } from 'react-redux';

export default class GraphEditor extends Component {
    
    constructor(props) {
        super(props);
        this.handleAddEngine = this.handleAddEngine.bind(this);
        this.handleAddCondition = this.handleAddCondition.bind(this);
        this.handleAddInput = this.handleAddInput.bind(this);
        this.addToCellToGraph = this.addToCellToGraph.bind(this);
        this.runWorkflow = this.runWorkflow.bind(this);
        this.handleSampleWorkflow = this.handleSampleWorkflow.bind(this);
        this.handleSaveWorkflow = this.handleSaveWorkflow.bind(this);
        this.handleLoadWorkflow = this.handleLoadWorkflow.bind(this);
        this.executeEngine = this.executeEngine.bind(this);
    }

    //Load Workflow
    handleSampleWorkflow(test) {
        switch(test) {
            case 'Sample':
                let graph = SampleWorflow;
                this.props.graph.fromJSON(graph);
            break;
            case 'Sample 2':
                graph = SampleWorflow2;
                this.props.graph.fromJSON(graph);
            break;
        }
        //Signal back for changes in the graph
        this.props.callback();
    }

    //Save Workflow
    handleSaveWorkflow() {

    }

    //Load Workflow
    handleLoadWorkflow() {

    }

    //Add Cell To Graph
    addToCellToGraph(unit) {
        var count = this.props.graph.getElements().length;
        unit.position(40 + 10*count, 40 + 10*count);
        this.props.graph.addCell(unit);
    }

    //Create executable
    handleAddEngine(label, type) {
        this.addToCellToGraph(Shapes.createEngine(label, type));
    }

    //Create fact
    handleAddInput() {
        this.addToCellToGraph(Shapes.createInput());
    }

    //Create condition
    handleAddCondition() {
        this.addToCellToGraph(Shapes.createCondition());
    }

    //Return true  is data modified/moved, false if opposite
    executeEngine(cell) {
        try {
            var desc = cell.prop('desc');//Contains ports with their values
            desc.completed = true;
            var guts = cell.prop('guts');//Contains inner params
            //console.log(guts);
            var outboundLinks = this.props.graph.getConnectedLinks(cell, { outbound: true })
            switch(guts.type) {
                case 'input'://Move data
                if(outboundLinks.length == 0) {
                    Toaster.create({
                        position: Position.BOTTOM,
                      }).show({
                        intent: Intent.WARNING,
                        timeout: 3000,
                        message: 'Missing connections'
                        });
                    return false;
                }    
                outboundLinks.map(link => {
                    var source_value = desc.ports[link.attributes.source.port].value;
                    var target = link.attributes.target;
                    var engines = this.props.graph.getElements().filter(elem => {
                        return elem.id == target.id;
                    });
                    var engine = engines[0];
                    //This is the targeted engine, now move data to corresponded port and try to execute if all ports have data
                    var new_desc = engine.prop("desc");
                    new_desc.ports[target.port].value = parseFloat(source_value);
                    engine.prop('desc', new_desc);
                })
                break;
                case 'exeSum':
                    desc.ports['out'].value = desc.ports['A'].value + desc.ports['B'].value;
                    cell.prop('desc', desc);
                    //Now transfer result to next node if any
                    outboundLinks.map(link => {
                        var target = link.attributes.target;
                        var engines = this.props.graph.getElements().filter(elem => {
                            return elem.id == target.id;
                        });
                        var engine = engines[0];
                        //This is the targeted engine, now move data to corresponded port and try to execute if all ports have data
                        var new_desc = engine.prop("desc");
                        new_desc.ports[target.port].value = parseFloat(desc.ports['out'].value);
                        engine.prop('desc', new_desc);
                    })
                    break;
                case 'exeSub':
                    desc.ports['out'].value = desc.ports['A'].value - desc.ports['B'].value;
                    cell.prop('desc', desc);
                    //Now transfer result to next node if any
                    outboundLinks.map(link => {
                        var link = outboundLinks[0];
                        var target = link.attributes.target;
                        var engines = this.props.graph.getElements().filter(elem => {
                            return elem.id == target.id;
                        });
                        var engine = engines[0];
                        //This is the targeted engine, now move data to corresponded port and try to execute if all ports have data
                        var new_desc = engine.prop("desc");
                        new_desc.ports[target.port].value = parseFloat(desc.ports['out'].value);
                        engine.prop('desc', new_desc);
                    })
                break;
                case 'exeDiv':
                    if(desc.ports['B'].value == 0) {//Port is not ready
                        return false;
                    }
                    desc.ports['out'].value = desc.ports['A'].value / desc.ports['B'].value;
                    cell.prop('desc', desc);
                    //Now transfer result to next node if any
                    outboundLinks.map(link => {
                        var link = outboundLinks[0];
                        var target = link.attributes.target;
                        var engines = this.props.graph.getElements().filter(elem => {
                            return elem.id == target.id;
                        });
                       var engine = engines[0];
                        //This is the targeted engine, now move data to corresponded port and try to execute if all ports have data
                        var new_desc = engine.prop("desc");
                        new_desc.ports[target.port].value = parseFloat(desc.ports['out'].value);
                        engine.prop('desc', new_desc);
                    })
                break;
                case 'exeMult':
                    desc.ports['out'].value = desc.ports['A'].value * desc.ports['B'].value;
                    cell.prop('desc', desc);
                    //Now transfer result to next node if any
                    outboundLinks.map(link => {
                        var link = outboundLinks[0];
                        var target = link.attributes.target;
                        var engines = this.props.graph.getElements().filter(elem => {
                            return elem.id == target.id;
                        });
                        var engine = engines[0];
                        //This is the targeted engine, now move data to corresponded port and try to execute if all ports have data
                        var new_desc = engine.prop("desc");
                        new_desc.ports[target.port].value = parseFloat(desc.ports['out'].value);
                        engine.prop('desc', new_desc);
                    })
                break;
                case 'conditional':
                    var valA = desc.ports['in 0'].value;
                    var valB = desc.ports['in 1'].value;
                    var portYes = desc.ports['yes'];
                    var portNo = desc.ports['no'];
                    switch(desc.value) {
                        case 'equal':
                          if(valA == valB) {
                            portYes.value = 1;
                            portNo.value = 0;
                          }
                          else {
                            portYes.value = 0;
                            portNo.value = 1;
                          }
                        break;
                        case 'not equal':
                            if(valA != valB) {
                                portYes.value = 1;
                                portNo.value = 0;
                            }
                            else {
                                portYes.value = 0;
                                portNo.value = 1;
                            }
                        break;
                        case 'greaterThanInclusive':
                            if(valA >= valB) {
                                portYes.value = 1;
                                portNo.value = 0;
                            }
                            else {
                                portYes.value = 0;
                                portNo.value = 1;
                            }
                        break;
                        case 'lessThanInclusive':
                            if(valA <= valB) {
                                portYes.value = 1;
                                portNo.value = 0;
                            }
                            else {
                                portYes.value = 0;
                                portNo.value = 1;
                            }
                        break;
                        case 'greaterThanExclusive':
                            if(valA > valB) {
                                portYes.value = 1;
                                portNo.value = 0;
                            }
                            else {
                                portYes.value = 0;
                                portNo.value = 1;
                            }
                        break;
                        case 'lessThanExclusive':
                            if(valA < valB) {
                                portYes.value = 1;
                                portNo.value = 0;
                            }
                            else {
                                portYes.value = 0;
                                portNo.value = 1;
                            }
                        break;
                    }
                }
            return true;
        }
        catch(e) {
            Toaster.create({
                position: Position.BOTTOM,
              }).show({
                intent: Intent.DANGER,
                timeout: 3000,
                message: e.message
                });
            return false;
        }
    }

    //runWorkflow
    runWorkflow() {
        let gr = JSON.stringify(this.props.graph.toJSON());
        let inputs = this.props.graph.getElements().filter(elem => {
            var guts = elem.prop('guts');
            return guts.type == 'input';
        });
        if(inputs.length == 0) {
            Toaster.create({
                position: Position.BOTTOM,
              }).show({
                intent: Intent.WARNING,
                timeout: 3000,
                message: 'Workflow lacks inputs'
                });
            return;
        }
        var last_cell = null;
        for(var i = 0; i < inputs.length; i++) {
            this.props.graph.bfs(inputs[i], (cell) => {
                last_cell = cell;
                this.executeEngine(cell);
            }, {outbound: true});
        };
        if(last_cell) {
            var guts = last_cell.prop('guts');
            var ports = last_cell.prop('desc').ports;
            if(guts.type.startsWith('exe')) {
                var value = 'Answer to the Ultimate Question of Life, the Universe, and Everything is ' + ports['out'].value.toFixed(2);
                Toaster.create({
                    position: Position.BOTTOM,
                  }).show({
                    intent: Intent.SUCCESS,
                    timeout: 5000,
                    message: value
                });
            }
            else if(guts.type == 'conditional') {
                if(ports['yes'].value == 1) {
                    last_cell.attr('rect/fill', 'green');
                }
                else {
                    last_cell.attr('rect/fill', 'red');
                }   
            }    
        //Signal back for changes in the graph
        this.props.callback();
        }
    }

    renderButton(text, iconName, disabled, menu) {
            return (
            <Popover content={menu} position={Position.LEFT_TOP}>
                <Button disabled={disabled} rightIcon='caret-right' icon={iconName} text={text} />
            </Popover>
        );
    }
    
    renderButtons() {
        let FileMenu = (
            <Menu>
                <MenuItem text="Input" icon="group-objects" onClick={() => this.handleAddInput()}/>
                <MenuDivider />
                <MenuItem text="Add" icon="add" onClick={() => this.handleAddEngine("A+B", "exeSum")}/>
                <MenuItem text="Subtruct" icon="remove" onClick={() => this.handleAddEngine("A-B", "exeSub")}/>
                <MenuItem text="Divide" icon="slash" onClick={() => this.handleAddEngine("A/B", "exeDiv")}/>
                <MenuItem text="Multiply" icon="selection" onClick={() => this.handleAddEngine("A*B", "exeMult")}/>
                <MenuDivider />
                <MenuItem text="Conditional" icon="filter" onClick={() => this.handleAddCondition()}/>
            </Menu>
        )
        
        let WorkflowMenu = (
            <Menu>
                <MenuItem text="Sample" icon="flows" onClick={() => this.handleSampleWorkflow('Sample')}/>
                <MenuItem text="Sample 2" icon="flows" onClick={() => this.handleSampleWorkflow('Sample 2')}/>
            </Menu>
        )
        return (
            <ButtonGroup vertical alignText='left'>
                {this.renderButton("Workflows", "database", false, WorkflowMenu)}
                {this.renderButton("Units", "database", false, FileMenu)}
                <Button onClick={() => this.runWorkflow()} icon="circle-arrow-right">Run</Button>
            </ButtonGroup>
        )
    }

    render() {
        return (
            <div>
                {this.props.graph ? this.renderButtons() : <div>There is no Graph.</div>}
            </div >
        )
    }
}

