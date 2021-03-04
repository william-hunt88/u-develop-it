const express = require('express');
const PORT = process.env.PORT || 3001;
const app = express();
const htmlRoutes = require('./routes/htmlRoutes');
const apiRoutes = require('./routes/apiRoutes')
app.use(express.static('public'));

app.use('/', htmlRoutes)
app.use('/api', apiRoutes)

// Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());





app.listen(PORT, () => {
    console.log(`API server now on port ${PORT}!`);
  });
