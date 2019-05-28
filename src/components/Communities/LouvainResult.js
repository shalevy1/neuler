import React from 'react'
import {Grid, Tab, Table} from "semantic-ui-react"
import PropertiesView from "../PropertiesView"

import { Loader } from 'semantic-ui-react'
const LoaderExampleInlineCentered = () => <Loader active inline='centered'>Algorithm running</Loader>

export default ({ task }) => (
  <Tab.Pane key={task.startTime.toLocaleString()} style={{ padding: '1em 0' }}>
    <Table color='green'>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Community</Table.HeaderCell>
          <Table.HeaderCell>Community Size</Table.HeaderCell>
          <Table.HeaderCell>Nodes</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {task.result ?
         task.result && task.result.map((result, idx) =>
          <Table.Row key={idx}>
            <Table.Cell>{result.community}</Table.Cell>
            <Table.Cell>{result.size}</Table.Cell>
            <Table.Cell>
              {result.nodes.map((r, i) =>
                <Grid columns={2}>
                  <Grid.Column>
                    {r.labels.join(', ')}
                  </Grid.Column>
                  <Grid.Column>
                    <PropertiesView inline={true} properties={r.properties} labels={r.labels}/>
                  </Grid.Column>
                </Grid>
              )}
            </Table.Cell>
          </Table.Row>
        ) :
        <Table.Row key="loading-centrality-result">
          <Table.Cell colSpan={4}>
            <LoaderExampleInlineCentered />
          </Table.Cell>
        </Table.Row>
}
      </Table.Body>
    </Table>
  </Tab.Pane>
)
