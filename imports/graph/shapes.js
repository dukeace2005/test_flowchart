import joint from 'jointjs'
import { Classes } from "@blueprintjs/core";

export default class Shapes {

  static createEngine(label, type) {
      var unit = new joint.shapes.devs.Model({
      position: { x: 40, y: 40 },
      size: { width: 100, height: 100 },
      inPorts: ['A', 'B'],
      outPorts: ['out'],
      ports: {
          groups: {
              'A': {
                  attrs: {
                      '.port-body': {
                          fill: 'white'
                      }
                  }
              },
              'B': {
                attrs: {
                    '.port-body': {
                        fill: 'white'
                    }
                }
            },
            'out': {
                  attrs: {
                      '.port-body': {
                          fill: 'grey'
                      }
                  }
              }
          }
      },
      attrs: {
          '.label': { text: label, 'font-size': 15, 'font-weight': 'bold', 'ref-x': .5, 'ref-y': .45 },
          rect: { fill: 'white' }
      }
    })

    var editable = {
        "label": label,
        "ports": {
            "A": {
                "value": 0
            },            
            "B": {
                "value": 0
            },           
            "out": {
                "value": 0
            }            
        }
    };
    var guts = {
        "type": type,
    };
    unit.prop('guts', guts);
    unit.prop('desc', editable);

    return unit;
  }

  static createCondition() {
    var unit = new joint.shapes.devs.Model({
      position: { x: 40, y: 40 },
      size: { width: 100, height: 100 },
      inPorts: ['in 0', "in 1"],
      ports: {
          groups: {
            'in 0': {
                attrs: {
                    '.port-body': {
                        fill: 'white'
                    }
                }
            },
            'in 1': {
                attrs: {
                    '.port-body': {
                        fill: 'white'
                    }
                }
            },
            'yes': {
                attrs: {
                    '.port-body': {
                        fill: 'white'
                    }
                }
              },
            'no': {
                attrs: {
                    '.port-body': {
                        fill: 'black'
                    }
                }
            }
        }
      },
      attrs: {
          '.label': { text: '==', 'font-size': 15, 'font-weight': 'bold', 'ref-x': .5, 'ref-y': .45 },
          rect: { fill: 'white' }
      }
    })

    var editable = {
        "label": '==',
        'value': 'equal',
        'operators': ['equal', 'not equal', 'greaterThanInclusive', 'lessThanInclusive', 'greaterThanExclusive', 'lessThanExclusive'],
        "ports": {
            "in 0": {
                "value": 0
            },            
            "in 1": {
                "value": 0
            },           
            "yes": {
                "value": 0
            },            
            "no": {
                "value": 0
            }            
        }
    };
    var guts = {
        "type": 'conditional',
    };
    unit.prop('guts', guts);
    unit.prop('desc', editable);

    return unit;
  }

  static createInput() {
    var unit = new joint.shapes.devs.Model({
      position: { x: 40, y: 40 },
      size: { width: 100, height: 100 },
      outPorts: ['out'],
      ports: {
          groups: {
            'out': {
                  attrs: {
                      '.port-body': {
                          fill: 'grey'
                      }
                  }
            }
        }
      },
      attrs: {
          '.label': { text: 'Input', 'font-size': 15, 'font-weight': 'bold', 'ref-x': .5, 'ref-y': .45 },
          'type': 'input',
          rect: { fill: 'white' }
      }
    })

    var editable = {
        "label": 'Input',
        "desc": '',
        "ports": {
            "out": {
                "value": 0
            }            
        }
    };
    var guts = {
        "type": 'input',
    };
    unit.prop('guts', guts);
    unit.prop('desc', editable);

    return unit;
  }
}