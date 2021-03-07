const express = require("express");
const router = express.Router();
const db = require("../../db/database");
const inputCheck = require("../../utils/inputCheck");

// Get all candidates
router.get("/candidates", (req, res) => {
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
router.get("/candidate/:id", (req, res) => {
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
router.delete("/candidate/:id", (req, res) => {
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
router.post("/candidate", ({ body }, res) => {
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

router.put("/candidate/:id", (req, res) => {
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

module.exports = router;
