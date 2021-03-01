const express = require('express');
const PORT = process.env.PORT || 3002;
const app = express();
const htmlRoutes = require('./routes/htmlRoutes');
const router = require('express').Router();
const path = require('path')
app.use(express.static('public'));


app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "./public/index.html"))
})

app.get("/notes", (req, res) => {
    res.sendFile(path.join(__dirname, "./public/notes.html"))
})

app.listen(PORT, () => {
    console.log(`API server now on port ${PORT}!`);
  });