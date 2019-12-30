'use strict'

// Requires
var express = require('express');
var bodyParser = require('body-parser');

// Ejecutar express
var app = express();

//  Cargar archivos de rutas
var user_routes = require('./routes/user');
var topic_routes = require('./routes/topic');
// Middlewares
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

// CORS

// Reescribir rutas
app.use('/api',user_routes);
app.use('/api',topic_routes);

// Exportar modulo
module.exports = app;