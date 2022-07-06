const { pathToRegexp, match } = require('path-to-regexp');
const { get } = require('lodash');
const graphql = require('./graphql');
const _ = require('underscore');

const mockMiddleware = options => async (req, res, next) => {
  const { getConfiguration, logger } = options;

  const { configuration, parsedPath } = await getConfiguration(req);

  if (!configuration) {
    return res.send({ message: 'No API configuration found' });
  }

  const endpoint = configuration.endpoints.find(endpointToMatch =>
    parsedPath.match(pathToRegexp(endpointToMatch.path))
  );

  if (!endpoint) {
    return res.send({ message: 'Path not found' });
  }

  const { params } = match(endpoint.path, { decode: decodeURIComponent })(parsedPath) || {};
  req.params = params;

  if (endpoint.graphql) {
    const graphqlResponse = await graphql(endpoint, req);
    return res.send(graphqlResponse);
  }

  const validOperators = ['eq', 'includes'];

  let response = {};
  const defaultResponse = (endpoint.responses[0]) ? endpoint.responses[0] : {};

  if (!endpoint.behavior) {
    response = defaultResponse;
  } else if (endpoint.behavior === 'random') {
    response = endpoint.responses[Math.floor(Math.random() * endpoint.responses.length)];
  } else if (endpoint.behavior === 'conditional') {
    const operators = {
      'eq': function(a, b) { return a === b },
      'includes': function(a, b) {
        if (typeof a === 'string' && typeof b === 'string') {
          let sanitizedA = a.replace(/\s+/g, '').toLowerCase();
          let sanitizedB = b.replace(/\s+/g, '').toLowerCase();

          return sanitizedA === sanitizedB;
        } else {
          return a == b;
        }
      }
    };
    response = response || defaultResponse;
    endpoint.responses.forEach(responseElement => {
      if (!validOperators.includes(responseElement.condition.operator)) {
        logger.error(
          `Invalid operator '${responseElement.condition.operator}'. Valid operators are: ${validOperators.join(', ')}. Includes is a case-insensitive whitespace-ignored string comparator.`
        );
      } else {
        if (operators[responseElement.condition.operator](get(req, responseElement.condition.comparand), responseElement.condition.value)) {
          response = responseElement;
        }
      }
    });
  }

  if (typeof response === "undefined" || response === null) {
    response = defaultResponse;
  }
  if (response && response.hasOwnProperty('delay') && response.delay > 0) {
    // TODO: Use async sleep
    const start = new Date().getTime();
    for (let i = 0; i < 1e7; i += 1) {
      if (new Date().getTime() - start > response.delay) {
        break;
      }
    }
  }

  if (get(response, 'body.$ref') || get(response, 'body.$ref.type') === 'collection') {
    const collection = configuration.references.find(collection => collection.id === response.body.$ref.id);
    if (response.body.$ref.find) {
      response.body = collection.data.find(
        item => item[response.body.$ref.find] === req.params[response.body.$ref.find]
      );
    } else {
      response.body = collection.data;
    }
  }

  try {
    if (req.is('application/json') && response.body) {
      let validJSON = JSON.parse(response.body);
      response.body = JSON.stringify(validJSON).replaceAll('/', '\\/');
      res.set("Content-Type", "application/json");
    }
  } catch (err) {
    logger.error(
        `Invalid JSON response body!`
    );
    console.log(response.body);
    console.log(err);
  }


  res.status(response.statusCode || 200);
  if (response.headers) {
    response.headers.forEach(header => {
      res.set(header.name, header.value);
    });
  }

  res.set('Access-Control-Allow-Origin', '*');

  return res.send(response.body);
};

module.exports = mockMiddleware;
