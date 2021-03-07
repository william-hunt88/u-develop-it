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
      try {
        fs.writeFile(
          path.join(__dirname, "../../db/db.json"), JSON.stringify(updatedNotes),
          function (err) {
            if (err) {
              console.log(err);
            } else {
              console.log('item successfully posted')
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

router.delete("/notes/:id", (req, res) => {
  fs.readFile(
    path.join(__dirname, "../../db/db.json"),
    "utf8",
    function (err, data) {
      var db = JSON.parse(data);
      newNotes = db.filter((note) => note.id !== req.params.id);
      // string = JSON.stringify(newNotes);
      if (err) {
        res.json(false);
      } else {
        try {
          fs.writeFile(
            path.join(__dirname, "../../db/db.json"),
            JSON.stringify(newNotes),
            function (err) {
              if (err) {
                console.log(err);
              } else {
                console.log('item successfully deleted')
                res.json(true);
              }
            }
          );
        } catch (err) {
          res.json(err);
        }
      }
    }
  );
});

module.exports = router;
