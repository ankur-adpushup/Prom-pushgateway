const express = require('express');
const cors = require('cors');
const {
  events,
  getContentType,
  getMetrics,
  registerEvent,
  updateMetric,
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
    let { eventName, eventData } = req.body;

    //event not registered!
    if (!events[eventName]) {
      registerEvent(eventName);
    }

    //Update metrics
    eventData.forEach((data) => {
      const { siteId, value } = data;
      updateMetric(eventName, siteId, value);
    });
    console.log('Event Metrics updated!');
    return res.status(200).send('Data updated!');
  } catch (err) {
    console.log(err);
    return res.status(500).send('Oops Error occured!');
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
