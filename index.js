'use strict'

const urldb ='mongodb://localhost:27017/forum';
var mongoose = require('mongoose');
var app = require('./app');
var port = process.env.PORT || 3700;

mongoose.set('useFindAndModify', false);
mongoose.Promise = global.Promise;
mongoose.connect(urldb, { useNewUrlParser: true}).then(()=>{
    console.log('La conexión a la base de datos se ha realizado correctamente!!!');

    //Crear servidor
    app.listen(port, ()=>{
        console.log('El servidor esta corriendo correctamente: http://localhost:3700');
    })
}).catch(error =>console.log(error));




