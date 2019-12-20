'use strict'
var jwt = require('jwt-simple');
var moment = require('moment');
var secret = "clave-secreta-para-generar-token-117";

exports.authenticated = function(req, res, next){

    // Comprobar si llega la cabecera de autorizacion
    if(!req.headers.authorization){
        return res.status(403).send({
            message: 'No existe authorizatión'
        });
    }
    // Limpiar el token y quitar comillas
    var token = req.headers.authorization.replace(/['"]+/g,'');

    try{
        // Decodificar token
        var payload = jwt.decode(token, secret);
        // Comprobar la expiración del token
        if(payload.exp <= moment().unix()){
            return res.status(404).send({
                message: 'El token a expirado'
            });
        }
    
    }catch(ex){
        return res.status(404).send({
            message: 'El token no es válido'
        });
    }
    
    // Adjuntar usuario identificado a la request para poder asi acceder al usuario 
    req.user = payload;

    // Pasar a la acción
    next();
};