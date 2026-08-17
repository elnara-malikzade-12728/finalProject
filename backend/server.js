require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Routes
const apiRoutes = require('./src/routes');
app.use('/api', apiRoutes);

app.get('/', (req, res) => {
  res.send({ status: 'ok', message: 'KaryeraYol backend running' });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
