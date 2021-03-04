const router = require("express").Router();
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

router.get("/notes", (req, res) => {
  fs.readFile(
    path.join(__dirname, "../../db/db.json"),
    "utf8",
    function (err, data) {
      if (err) {
        res.json(false);
      } else {
        res.json(JSON.parse(data));
      }
    }
  );
});

router.post("/notes", (req, res) => {
  console.log(req.body)
  fs.readFile(
    path.join(__dirname, "../../db/db.json"),
    "utf8",
    function (err, data) {
      if (err) {
        throw err;
      }
      var db = JSON.parse(data);
      var newNotes = { ...req.body, id: uuidv4() };
      var updatedNotes = [newNotes, ...db];
      console.log(updatedNotes)
      try {
        fs.writeFile(
          path.join(__dirname, "../../db/db.json"),
          updatedNotes,
          function (err) {
            if (err) {
              console.log(err);
            } else {
              res.json(true);
            }
          }
        );
      } catch (err) {
        res.json(err);
      }
    }
  );
});

router.delete("/notes/:id", (req, res) => {});

///filter db array - only keep notes where id does not equal req.params.id

module.exports = router;
