 
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const reviewsRouter = require('./routes/reviews');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

app.use('/api/reviews', reviewsRouter);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});