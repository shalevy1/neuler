import React, {Component} from 'react'
import { Form, Label, Input } from "semantic-ui-react"
import CentralityForm from './CentralityForm'

export default class extends Component {
  state = {
    advanced: false
  }

  render() {
    console.log(this.props)
    const { labelOptions, relationshipTypeOptions, onChange, writeProperty, weightProperty, defaultValue, concurrency, direction, persist } = this.props

    return (
      <Form size='mini' style={{ marginBottom: '1em' }}>
        <CentralityForm onChange={onChange} direction={direction} writeProperty={writeProperty} weightProperty={weightProperty} persist={persist} concurrency={concurrency} labelOptions={labelOptions} relationshipTypeOptions={relationshipTypeOptions}/>
        <Form.Field inline>
          <label style={{ 'width': '8em' }}>Weight Property</label>
          <input
            placeholder='Weight Property'
            value={weightProperty}
            onChange={evt => onChange('weightProperty', evt.target.value)}
            style={{ 'width': '10em' }}
          />
        </Form.Field>
        {
          weightProperty ?
            <Form.Field inline>
              <label style={{ 'width': '8em' }}>Default weight</label>
              <input
                value={defaultValue}
                onChange={evt => onChange('defaultValue', evt.target.value)}
                style={{ 'width': '7em' }}
              />
            </Form.Field>
            : null
        }
      </Form>
    )
  }
}
