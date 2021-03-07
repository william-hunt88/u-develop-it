const express = require('express');
const PORT = process.env.PORT || 3001;
const app = express();
const htmlRoutes = require('./routes/htmlRoutes');
const apiRoutes = require('./routes/apiRoutes')
app.use(express.static('public'));

// Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use('/', htmlRoutes)
app.use('/api', apiRoutes)


app.listen(PORT, () => {
    console.log(`API server now on port ${PORT}!`);
  });
