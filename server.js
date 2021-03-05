const express = require("express");

const PORT = process.env.PORT || 3001;
const app = express();

const sqlite3 = require("sqlite3").verbose();

const inputCheck = require("./utils/inputCheck");

// Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Connect to database
const db = new sqlite3.Database("./db/election.db", (err) => {
  if (err) {
    return console.error(err.message);
  }

  console.log("Connected to the election database.");
});

// Get all candidates
app.get("/api/candidates", (req, res) => {
  const sql = `SELECT candidates.*, parties.name 
  AS party_name 
  FROM candidates 
  LEFT JOIN parties 
  ON candidates.party_id = parties.id`;
  const params = [];
  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    res.json({
      message: "success",
      data: rows,
    });
  });
});

// // Get a single candidate
app.get("/api/candidate/:id", (req, res) => {
  const sql = `SELECT candidates.*, parties.name 
  AS party_name 
  FROM candidates 
  LEFT JOIN parties 
  ON candidates.party_id = parties.id 
  WHERE candidates.id = ?`;
  const params = [req.params.id];

  db.get(sql, params, (err, row) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }

    res.json({
      message: "success",
      data: row,
    });
  });
});

// // Delete a candidate
app.delete("/api/candidate/:id", (req, res) => {
  const sql = "DELETE FROM candidates WHERE id = ?";
  const params = [req.params.id];

  db.run(sql, params, function (err, result) {
    if (err) {
      res.status(400).json({ error: res.message });
      return;
    }

    res.json({
      message: "succesfully deleted",
      changes: this.changes,
    });
  });
});

// Create a candidate
app.post("/api/candidate", ({ body }, res) => {
  const errors = inputCheck(
    body,
    "first_name",
    "last_name",
    "industry_connected"
  );
  if (errors) {
    res.status(400).json({ error: errors });
    return;
  }

  const sql = `INSERT INTO candidates (first_name, last_name, industry_connected) 
              VALUES (?,?,?)`;
  const params = [body.first_name, body.last_name, body.industry_connected];
  // ES5 function, not arrow function, to use `this`
  db.run(sql, params, function (err, result) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }

    res.json({
      message: "success",
      data: body,
      id: this.lastID,
    });
  });
});

// What request type would be appropriate for updating data? We've established that GET is for reading, POST for creating, and DELETE for deleting.
// None of those make sense for updating, but there is a fourth request type we can use: the PUT request.

// This route might feel a little strange because we're using a parameter for the candidate's id (req.params.id), but the request body contains the party's id (req.body.party_id).
// Why mix the two? Again, we want to follow best practices for consistency and clarity.
// The affected row's id should always be part of the route (e.g., /api/candidate/2) while the actual fields we're updating should be part of the body.

// If the front end will be making this request, though, then we should be extra sure that a party_id was provided before we attempt to update the database. 
// Let's leverage our friend's inputCheck() function again to do so.

app.put("/api/candidate/:id", (req, res) => {
  const errors = inputCheck(req.body, "party_id");

  if (errors) {
    res.status(400).json({ error: errors });
    return;
  }
  const sql = `UPDATE candidates SET party_id = ? 
               WHERE id = ?`;
  const params = [req.body.party_id, req.params.id];

  db.run(sql, params, function (err, result) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }

    res.json({
      message: "success",
      data: req.body,
      changes: this.changes,
    });
  });
});

app.get("/api/parties", (req, res) => {
  const sql = `SELECT * FROM parties`;
  const params = [];
  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    res.json({
      message: "success",
      data: rows,
    });
  });
});

app.get("/api/party/:id", (req, res) => {
  const sql = `SELECT * FROM parties WHERE id = ?`;
  const params = [req.params.id];
  db.get(sql, params, (err, row) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }

    res.json({
      message: "success",
      data: row,
    });
  });
});

// Building a delete route will give us an opportunity to test the ON DELETE SET NULL constraint effect through the API.
// Because the intention of this route is to remove a row from the table, we should use app.delete() instead of app.get().
// We also need to use normal function syntax for the db.run() callback instead of an arrow function, or else we'd lose the context of this.changes.

app.delete("/api/party/:id", (req, res) => {
  const sql = `DELETE FROM parties WHERE id = ?`;
  const params = [req.params.id];
  db.run(sql, params, function (err, result) {
    if (err) {
      res.status(400).json({ error: res.message });
      return;
    }

    res.json({ message: "successfully deleted", changes: this.changes });
  });
});

// Default response for any other requests(Not Found) Catch all
app.use((req, res) => {
  res.status(404).end();
});

// Start server after DB connection
db.on("open", () => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
