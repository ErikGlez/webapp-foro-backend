'use strict'

var express = require('express');
var TopicController = require('../controllers/topic');

var router = express.Router();
var md_auth = require('../middleware/authenticated');

router.get('/test', TopicController.test);

module.exports =  router;
