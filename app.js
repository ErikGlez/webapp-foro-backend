'use strict'

// Requires
var express = require('express');
var bodyParser = require('body-parser');

// Ejecutar express
var app = express();

//  Cargar archivos de rutas

// Middlewares
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

// CORS

// Reescribir rutas

//Ruta/metodo de prueba
app.get('/prueba', (req, res)=>{
   
    //return res.status(200).send("<h1>Hola mundo desde el backend</h1>");
    
    return res.status(200).send({
        nombre: 'Erik Gonzalez',
        message: 'Hola mundo desde el backend con Node'
    });
    
});

// Exportar modulo
module.exports = app;