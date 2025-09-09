const express = require("express");
const mysql = require("mysql2");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const { v4: uuidv4 } = require("uuid");

app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

let connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "vinayak",
  database: "app",
});

app.get("/", (req, res) => {
  let q = `SELECT count(*) as count FROM user`;
  connection.query(q, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Database query failed.");
    }
    let count = result[0].count;
    res.render("home.ejs", { count });
  });
});

app.get("/user", (req, res) => {
  let q = `SELECT * FROM user`;
  connection.query(q, (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Database query failed.");
    }
    res.render("users.ejs", { data });
  });
});

app.get("/user/new", (req, res) => {
  res.render("new.ejs");
});

app.post("/user/new", (req, res) => {
  let { username, email, password } = req.body;
  let id = uuidv4();
  let q = `INSERT INTO user (id, username, email, password) VALUES (?, ?, ?, ?)`;
  let values = [id, username, email, password];

  connection.query(q, values, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Failed to add new user.");
    }
    console.log("Added new user");
    res.redirect("/user");
  });
});

app.get("/user/:id/edit", (req, res) => {
  let { id } = req.params;
  let q = `SELECT * FROM user WHERE id = ?`;

  connection.query(q, [id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Database query failed.");
    }
    if (result.length === 0) {
      return res.status(404).send("User not found.");
    }
    let user = result[0];
    res.render("edit.ejs", { user });
  });
});

app.patch("/user/:id", (req, res) => {
  let { id } = req.params;
  let { username, password } = req.body;
  let qSelect = `SELECT * FROM user WHERE id = ?`;

  connection.query(qSelect, [id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Database query failed.");
    }
    if (result.length === 0) {
      return res.status(404).send("User not found.");
    }
    let user = result[0];

    if (user.password !== password) {
      res.send("WRONG Password entered!");
    } else {
      let qUpdate = `UPDATE user SET username = ? WHERE id = ?`;
      connection.query(qUpdate, [username, id], (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).send("Failed to update user.");
        }
        console.log("Updated!");
        res.redirect("/user");
      });
    }
  });
});

app.get("/user/:id/delete", (req, res) => {
  let { id } = req.params;
  let q = `SELECT * FROM user WHERE id = ?`;
  connection.query(q, [id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Database query failed.");
    }
    if (result.length === 0) {
      return res.status(404).send("User not found.");
    }
    let user = result[0];
    res.render("delete.ejs", { user });
  });
});

// Delete user route
app.delete("/user/:id", (req, res) => {
  let { id } = req.params;
  let { password } = req.body;
  let qSelect = `SELECT * FROM user WHERE id = ?`;

  connection.query(qSelect, [id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Database query failed.");
    }
    if (result.length === 0) {
      return res.status(404).send("User not found.");
    }
    let user = result[0];

    if (user.password !== password) {
      res.send("WRONG Password entered!");
    } else {
      let qDelete = `DELETE FROM user WHERE id = ?`;
      connection.query(qDelete, [id], (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).send("Failed to delete user.");
        }
        console.log("Deleted!");
        res.redirect("/user");
      });
    }
  });
});

app.listen("8080", () => {
  console.log("Server running on port 8080");
});
