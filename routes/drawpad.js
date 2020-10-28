const cons = require("consolidate");
const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
  res.render("drawPad");
});
module.exports = router;
