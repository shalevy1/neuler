import {
    Button,
    Card,
    CardGroup,
    Icon,
    Container,
    Header,
    Modal,
    Loader,
    Segment,
    Dimmer,
    Message
} from "semantic-ui-react"
import React, {Component} from 'react'
import {runCypher} from "../services/stores/neoStore"


class Datasets extends Component {
    state = {
        open: false,
        selectedDataset: "Game of Thrones",
        currentQueryIndex: -1,
        completedQueryIndexes: {},
        completed: false
    }

    show = (dimmer, datasetName) => () => this.setState({dimmer, open: true, selectedDataset: datasetName})
    close = () => this.setState({open: false})

    loadDataset() {
        const { selectedDataset } = this.state
        const queries = sampleGraphs[selectedDataset].queries;
        queries.reduce((promiseChain, query, qIndex) => {
            return promiseChain.then(chainResults => {
                  this.setState({ currentQueryIndex: qIndex })
                  return runCypher(query).then(currentResult => {
                      this.setState({
                          completedQueryIndexes: { ...this.state.completedQueryIndexes, [qIndex]: true }
                      })
                      return [...chainResults, currentResult]
                  })
              }
            );
        }, Promise.resolve([]))
          .then(results => {
              this.setState({
                  currentQueryIndex: -1,
                  completed: true
              })

              this.props.onComplete()
          })
    }

    render() {
        const containerStyle = {
            margin: "1em",
        }

        const { open, dimmer, selectedDataset, currentQueryIndex, completedQueryIndexes, completed } = this.state

        return (<div style={containerStyle}>
                <Container fluid>
                    <Message>
                        Below are some sample graphs that are useful for learning how to use the graph algorithms
                        library.
                        Note that clicking on Load will import data into your graph, so don't do this on a production
                        database.
                    </Message>

                    <CardGroup>
                        {Object.keys(sampleGraphs).map(key => (
                            <Card key={sampleGraphs[key].name}>
                                <Card.Content>
                                    <Icon name='sitemap'/>
                                    <Card.Header>
                                        {sampleGraphs[key].name}
                                    </Card.Header>
                                    <Card.Meta>
                                        {sampleGraphs[key].description}
                                    </Card.Meta>
                                </Card.Content>
                                <Card.Content extra>
                                    <div className='ui two buttons'>
                                        <Button basic color='green' onClick={this.show(true, sampleGraphs[key].name)}>
                                            Load
                                        </Button>
                                    </div>
                                </Card.Content>
                            </Card>
                        ))}

                    </CardGroup>

                    <Modal dimmer={dimmer} open={open} onClose={this.close}>
                        <Modal.Header>Are you sure you want to load this sample graph?</Modal.Header>
                        <Modal.Content >
                            <Modal.Description>
                                <Header>{sampleGraphs[selectedDataset].name}</Header>
                                <Message warning>
                                    <Message.Header>ACHTUNG!</Message.Header>
                                    <p>Pressing the 'Yes, load it!' button below will run the following Cypher
                                        statements:</p>
                                </Message>
                                <div>

                                    {sampleGraphs[selectedDataset].queries.map((query, queryIndex) => (
                                      <Segment>
                                          {completedQueryIndexes[queryIndex] ? <Icon color='green' name='check'/> : null}
                                          <pre style={{ whiteSpace: 'pre-wrap' }}>{query}</pre>
                                          <Dimmer active={queryIndex === currentQueryIndex}>
                                              <Loader>Running</Loader>
                                          </Dimmer>
                                      </Segment>
                                    ))}

                                </div>

                            </Modal.Description>
                        </Modal.Content>
                        <Modal.Actions>
                            {completed
                              ? <Button positive
                                        content="Done"
                                        onClick={this.close}/>
                              : <div>
                                  <Button
                                    disabled={currentQueryIndex >= 0}
                                    positive
                                    color='green'
                                    content="Yes, load it!"
                                    onClick={this.loadDataset.bind(this)}
                                  />
                                  <Button disabled={currentQueryIndex >= 0} color='black' onClick={this.close}>
                                      No, get me outta here!
                                  </Button>
                              </div>
                            }
                        </Modal.Actions>
                    </Modal>

                </Container>
            </div>
        )

    }
}

const sampleGraphs = {
    "Game of Thrones": {
        name: "Game of Thrones",
        description: `A dataset containing interactions between the characters across the first 7 seasons of the popular TV show.`,
        queries: [
            `CREATE CONSTRAINT ON (c:Character) ASSERT c.id IS UNIQUE`,
            `UNWIND range(1,7) AS season
LOAD CSV WITH HEADERS FROM "https://github.com/neo4j-apps/neuler/raw/master/sample-data/got/got-s" + season + "-nodes.csv" AS row
MERGE (c:Character {id: row.Id})
ON CREATE SET c.name = row.Label`,
            `UNWIND range(1,7) AS season
LOAD CSV WITH HEADERS FROM "https://github.com/neo4j-apps/neuler/raw/master/sample-data/got/got-s" + season + "-edges.csv" AS row
MATCH (source:Character {id: row.Source})
MATCH (target:Character {id: row.Target})
CALL apoc.merge.relationship(source, "INTERACTS_SEASON" + season, {}, {}, target) YIELD rel
SET rel.weight = toInteger(row.Weight)`
        ]
    },

    "European Roads": {
        name: "European Roads",
        description: `A dataset containing European Roads.`,
        queries: [
            `CREATE CONSTRAINT ON (p:Place) ASSERT p.name IS UNIQUE`,
            `USING PERIODIC COMMIT 1000
LOAD CSV WITH HEADERS FROM "https://github.com/neo4j-apps/neuler/raw/master/sample-data/eroads/roads.csv"
AS row

MERGE (origin:Place {name: row.origin_reference_place})
SET origin.countryCode = row.origin_country_code

MERGE (destination:Place {name: row.destination_reference_place})
SET destination.countryCode = row.destination_country_code

MERGE (origin)-[eroad:EROAD {road_number: row.road_number}]->(destination)
SET eroad.distance = toInteger(row.distance), eroad.watercrossing = row.watercrossing`
        ]
    }

}

export default Datasets
