const express = require("express");
const router = express.Router();
const db = require("../../db/database");
const inputCheck = require("../../utils/inputCheck");


// Get the total votes for all the candidates
router.get('/votes', (req, res) => {
    const sql =  `SELECT candidates.*, parties.name AS party_name, 
                  COUNT(candidate_id) 
                  AS count FROM votes 
                  LEFT JOIN candidates ON votes.candidate_id = candidates.id 
                  LEFT JOIN parties ON candidates.party_id = parties.id 
                  GROUP BY candidate_id 
                  ORDER BY count DESC`;
    const params = [];
    db.all(sql, params, (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
  
      res.json({
        message: 'success',
        data: rows
      });
    });
  });

// Before we build the POST route, take a moment to think about how it will be used. 
// The front end will need to send us IDs for the voter and candidate. 
// Both fields are required, meaning we should probably use our friend's inputCheck() function again. 
// We also want to avoid malicious SQL injection, which warrants using prepared statements.

router.post("/vote", ({ body }, res) => {
  // Data validation
  const errors = inputCheck(body, "voter_id", "candidate_id");
  if (errors) {
    res.status(400).json({ error: errors });
    return;
  }

  // Prepare statement
  const sql = `INSERT INTO votes (voter_id, candidate_id) VALUES (?, ?)`;
  const params = [body.voter_id, body.candidate_id];

  // Execute
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


module.exports = router;