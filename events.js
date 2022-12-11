const client = require('prom-client');
const eventNames = require('./constants');

let register;

const events = {
  INSTREAM_ERROR: new client.Gauge({
    name: eventNames.INSTREAM_ERROR,
    help: 'THIS IS TESTING',
    labelNames: ['siteId'],
  }),
};

const registerEvents = () => {
  register = new client.Registry();

  //register events
  register.registerMetric(events[eventNames.INSTREAM_ERROR]);

  client.collectDefaultMetrics({ register });
};
registerEvents();

module.exports = { events, register };