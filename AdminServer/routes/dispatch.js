var express = require('express');

var router = express.Router();

var func = require('./func');

// Dispatch
router.post('/hello', (req, res) => {func.Hello(req,res);});
router.post('/get_account_info', (req, res) => {func.GetAccountInfo(req,res)});
router.post('/get_char_info', function(req, res) {func.GetCharInfo(req, res);});

module.exports = router;
