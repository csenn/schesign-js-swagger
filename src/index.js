import isString from 'lodash/isString'
import pluralize from 'pluralize'
import { generateFromClass as generateJsonSchema } from '../../schesign-js-json-schema'

const lowercaseFirstLetter = str => str.charAt(0).toLowerCase() + str.slice(1)

function _addClass (context, uid) {
  const classItem = context.classCache[uid]
  const pathLabel = pluralize(lowercaseFirstLetter(classItem.label))

  const schema = generateJsonSchema(context.graph, uid)
  const schemaDefinitions = schema.definitions
  delete schema.id
  delete schema.$schema
  delete schema.definitions

  const nextUid = uid.replace(/\//g, '*')
  const defLabel = `#/definitions/${nextUid}`
  Object.assign(context.definitions, schemaDefinitions, {
    [nextUid]: schema
  })

  const paths = {
    [`/${pathLabel}`]: {
      get: {
        description: `Returns a list of type ${classItem.label}`,
        responses: {
          '200': {
            description: 'list response',
            schema: {
              type: 'array',
              items: { '$ref': defLabel }
            }
          }
        }
      },
      post: {
        description: `Creates an item of type ${classItem.label}`,
        parameters: [{
          name: classItem.label,
          in: 'body',
          required: true,
          schema: {
            $ref: defLabel
          }
        }],
        responses: {
          '200': {
            description: 'create response',
            schema: { '$ref': defLabel }
          }
        }
      }
    },
    [`/${pathLabel}/{id}`]: {
      get: {
        description: `Returns an item of type ${classItem.label} by id`,
        parameters: [{
          name: 'id',
          in: 'path',
          required: true,
          type: 'string'
        }],
        responses: {
          '200': {
            description: 'get by id response',
            schema: { '$ref': defLabel }
          }
        }
      },
      put: {
        description: `Updates an item of type ${classItem.label}`,
        parameters: [{
          name: classItem.label,
          in: 'body',
          required: true,
          schema: {
            $ref: defLabel
          }
        }],
        responses: {
          '200': {
            description: 'update item',
            schema: { '$ref': defLabel }
          }
        }
      },
      delete: {
        description: `Deletes an item of type ${classItem.label} by id`,
        parameters: [{
          name: 'id',
          in: 'path',
          required: true,
          type: 'string'
        }],
        responses: {
          '204': {
            description: 'delete item'
          }
        }
      }
    }
  }

  Object.assign(context.paths, paths)
}

export function generateFromClasses (graph, classUids, opts = {}) {
  if (isString(classUids)) {
    classUids = [classUids]
  }

  /* Create a simple context obj to thread through */
  const context = {
    graph,
    classCache: {},
    propertyCache: {},
    paths: {},
    definitions: {}
  }

  /* Create a dict lookup for classes and properties for speed and convenience */
  graph.forEach(node => {
    if (node.type === 'Class') {
      context.classCache[node.uid] = node
    } else if (node.type === 'Property') {
      context.propertyCache[node.uid] = node
    }
  })

  classUids.forEach(uid => _addClass(context, uid))

  return {
    swagger: '2.0',
    info: {
      description: 'Auto-Generated Swagger Documentation'
    },
    consumes: ['application/json'],
    produces: ['application/json'],
    paths: context.paths,
    definitions: context.definitions
  }
}
