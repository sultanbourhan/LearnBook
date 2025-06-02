const express = require("express");
const path = require("path");
const { check_login } = require("../services/authServicrs");

const upload_routes = express.Router();

// Route to serve uploaded files
upload_routes.route("/:filename")
  .get(check_login, (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../uploads', filename);
    res.sendFile(filePath);
  });

module.exports = upload_routes;
