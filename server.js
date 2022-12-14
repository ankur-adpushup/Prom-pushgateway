const express = require('express');
const cors = require('cors');
const {
  events,
  getContentType,
  getMetrics,
  registerEvent,
  updateMetric,
  resetAllEventMetrics,
} = require('./events');

const app = express();

require('dotenv').config();

app.use(express.json());
app.use(cors());

app.get('/test', (req, res) => {
  return res.status(200).json('Server is working!');
});

//exposing metrics endpoint
app.get('/metrics', async (req, res) => {
  try {
    res.setHeader('Content-type', getContentType());
    return res.end(await getMetrics());
  } catch (err) {
    console.log('THE ERROR IS : ', err);
    return res.status(500).send('Oops Error occured!');
  }
});

app.post('/log', (req, res) => {
  try {
    // let { eventName, eventData } = req.body;
    const data = req.body;

    //data is empty
    if (JSON.stringify(data) === '{}')
      return res.status(500).send('No data sent!!');

    const eventNames = Object.keys(data);

    eventNames.forEach((eventName) => {
      //event not registered!
      if (!events[eventName]) {
        registerEvent(eventName);
      }

      eventData = data[eventName];
      eventData.forEach((metricData) => {
        const { siteId, value } = metricData;
        updateMetric(eventName, siteId, value);
      });
      console.log(`${eventName} metric updated`);
    });

    return res.status(200).send('Data updated! ');
  } catch (err) {
    console.log(err);
    return res.status(500).send('Oops Error occured!');
  }
});

app.delete('/reset-events', (req, res) => {
  try {
    resetAllEventMetrics();

    console.log('All Metrics Reset!');

    return res.status(200).send('All Metrics Reset!');
  } catch (err) {
    console.log('Error is : ', err);

    return res.status(500).send('Oops and error occured!');
  }
});

//Error handler
app.use((err, req, res, next) => {
  res.status(500).send(err.message);
  console.log('THE ERROR IS : ', err);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, (req, res) => {
  console.log(`Server started on port ${PORT}`);
});
