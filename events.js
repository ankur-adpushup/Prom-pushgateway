const client = require('prom-client');

let register = new client.Registry();
let events = {};

const getNewEvent = (eventName, labelNames) => {
  return new client.Gauge({
    name: eventName,
    help: eventName,
    labelNames: labelNames,
  });
};

const registerEvent = (eventName) => {
  if (register && eventName && !events[eventName]) {
    events[eventName] = getNewEvent(eventName, ['siteId']);
    register.registerMetric(events[eventName]);
    console.log(`${eventName} custom metric registered!`);
  }
};

const getMetrics = async () => {
  return await register.metrics();
};

const updateMetric = (eventName, siteId, value) => {
  if (events && events[eventName] && events[eventName].set) {
    events[eventName].set({ siteId }, Number(value));
  } else {
    console.log('Event Metric not present!');
  }
};

const clearEventMetrics = (eventNames) => {
  eventNames.forEach((eventName) => {
    if (register && events && events[eventName]) {
      delete events[eventName];
      register.removeSingleMetric(eventName);
    }
  });
};

const getContentType = () => {
  if (!register) {
    console.log("register was'nt found!");
    return;
  }
  return register.contentType;
};

// client.collectDefaultMetrics({ register });

module.exports = {
  events,
  getContentType,
  getMetrics,
  registerEvent,
  updateMetric,
  clearEventMetrics,
};
