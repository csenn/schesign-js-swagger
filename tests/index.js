import { expect } from 'chai'
import { generateFromClasses } from '../src'

import basic from 'schesign-graph-examples/graphs/export/basic'
import propertyVariations from 'schesign-graph-examples/graphs/export/property_variations'
// import recursion from 'schesign-graph-examples/graphs/export/recursion'
import linkedNodes2 from 'schesign-graph-examples/graphs/export/linked_nodes_2'
// import inheritanceChain2 from 'schesign-graph-examples/graphs/export/inheritance_chain_2'

const { describe, it } = global

describe('generateFromClasses()', () => {
  it('should convert basic to swagger', () => {
    const json = generateFromClasses(
      basic.graph,
      'o/tests/basic/master/class/class_a'
    )
    expect(json).to.deep.equal(require('./fixtures/basic.swagger.json'))
  })

  it('should convert propertyVariations to swagger', () => {
    const json = generateFromClasses(
      propertyVariations.graph,
      'o/tests/property_variations/master/class/class1'
    )
    expect(json).to.deep.equal(require('./fixtures/property_variations.swagger.json'))
  })

  it('should convert LinkedNodes to a swagger', () => {
    const json = generateFromClasses(
      linkedNodes2.graph,
      'o/tests/linked_nodes_2/master/class/class3'
    )
    expect(json).to.deep.equal(require('./fixtures/linked_nodes.swagger.json'))
  })
})
