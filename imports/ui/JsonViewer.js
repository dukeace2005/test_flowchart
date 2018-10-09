import React from 'react'
import ReactJSON from 'react-json-view'

const JsonViewer = (props) => {
  return (
    <div className='simple-div'>
      <ReactJSON
        name={props.name}
        src={props.json}
        theme={props.theme}
        displayDataTypes={false}
        displayObjectSize={false}
        onEdit={(edit)=>{return props.editCallback(edit)}}
        onSelect={(edit)=>{return props.selectCallback(edit)}}
      />
    </div>
  )
}

export default JsonViewer;