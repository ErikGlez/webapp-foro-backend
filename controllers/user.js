'use strict'
var validator = require('validator');
var bcrypt = require('bcrypt-nodejs');
var fs = require('fs');
var path = require('path');
var User = require('../models/user');
var jwt = require('../services/jwt');


var controller = {

    probando: function (req, res) {
        return res.status(200).send({
            message: "soy el metodo probando"
        });
    },

    testeando: function (req, res) {
        return res.status(200).send({
            message: "soy el metodo testeando"
        });
    },

    save: function (req, res) {
        // Recoger los parametros de la peticion
        var params = req.body;

        // validar los datos
        try {
            var validate_name = !validator.isEmpty(params.name);
            var validate_surname = !validator.isEmpty(params.surname);
            var validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
            var validate_password = !validator.isEmpty(params.password);
        } catch (err) {
            return res.status(400).send({
                message: "Datos incompletos",
                params
            });
        }


        //console.log(validate_name, validate_surname, validate_email, validate_password);
        if (validate_name && validate_surname && validate_email && validate_password) {

            // Crear objeto de usuarios
            var user = new User();

            // Asignar valores al usuario
            user.name = params.name;
            user.surname = params.surname;
            user.email = params.email.toLowerCase();
            user.role = 'ROLE_USER';
            user.image = null;

            // Comprobar si el usuario existe
            User.findOne({ email: user.email }, (err, issetUser) => {
                if (err) {
                    return res.status(500).send({
                        message: "Error al comprobar duplicidad de usuario"
                    });
                }

                // Si no existe,
                if (!issetUser) {
                    // Cifrar la contraseña
                    bcrypt.hash(params.password, null, null, (err, hash) => {
                        user.password = hash;
                        // Guardar usuario
                        user.save((err, userStored) => {
                            if (err) {
                                return res.status(400).send({
                                    message: "Error al guardar el usuario"
                                });
                            }

                            if (!userStored) {
                                return res.status(500).send({
                                    message: "No ha sido posible guardar el usuario"
                                });
                            }
                            // Devoler respuesta
                            return res.status(200).send({
                                message: "Usuario registrado con exito",
                                status: 'success',
                                user: userStored
                            });
                        }); // close save

                    }); // close bcrypt

                } else {
                    return res.status(400).send({
                        message: "El usuario ya esta registrado",

                    });
                }
            });

        } else {
            return res.status(400).send({
                message: "Los datos no son validos",

            });
        }

    },

    login: function (req, res) {
        // Recoger los parametros de la petición
        var params = req.body;
        // Validar los datos
        try {
            var validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
            var validate_password = !validator.isEmpty(params.password);
        } catch (err) {
            return res.status(400).send({
                message: "Datos incompletos",
                params
            });
        }

        if (!validate_email || !validate_password) {
            return res.status(400).send({
                message: "Los datos son incorrectos"
            })
        }
        // Buscar usuarios que coincidan con el email
        User.findOne({ email: params.email.toLowerCase() }, (err, user) => {
            if (err) {
                return res.status(500).send({
                    message: "Error al intentar identificarse"

                })
            }

            if (!user) {
                return res.status(400).send({
                    message: "El usuario no existe"
                })
            }
            // Si lo encuentra, 
            // comprobar la contraseña (coincidencia de email y password / bcrypt )
            bcrypt.compare(params.password, user.password, (err, check) => {
                // si las credenciales coinciden
                if (check) {
                    // Generar token de jwt y devolverlo (mas tarde)
                    if (params.gettoken) {
                        //Devolver los datos
                        return res.status(200).send({
                            token: jwt.createToken(user)
                        });
                    } else {
                        // Limpiar el objeto antes de devolverlo
                        user.password = undefined;
                        // devolver los datos
                        return res.status(200).send({
                            message: "Usuario identificado",
                            status: "success",
                            user
                        });
                    }


                } else {
                    return res.status(400).send({
                        message: "La credenciales no coinciden"
                    })
                }


            });
        });


    },

    update: function (req, res) {
        // Recoger datos del usuario
        var params = req.body;

        // Validar datos
        try {
            var validate_name = !validator.isEmpty(params.name);
            var validate_surname = !validator.isEmpty(params.surname);
            var validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
        } catch (err) {
            return res.status(400).send({
                message: "Datos incompletos",
                params
            });
        }
        // Eliminar propiedades innecesarias
        delete params.password;
        var userId = req.user.sub;

        // Comprobar si el email es unico (evitar duplicidad)
        if(req.user.email != params.email){
            User.findOne({ email: params.email.toLowerCase() }, (err, user) => {
                if (err) {
                    return res.status(500).send({
                        message: "Error al intentar modificar el email"
    
                    });
                }
                // si encuentra un usuario con ese email (no registrar)
                if (user && user.email == params.email) {
                    return res.status(400).send({
                        message: "Este email ya esta registrado"
                    });
                }

                // No encontro usuario con el mismo email
                // Buscar y actualizar documento
                User.findOneAndUpdate({ _id: userId }, params, { new: true }, (err, userUpdated) => {
                
                if (err) {

                    return res.status(400).send({
                        message: 'Error al intentar actualizar  el usuario'
                    });
                } 

                if (!userUpdated) {

                    return res.status(500).send({
                        message: 'No se logro actualizar el usuario'
                    });
                }

                // Devolver respuesta
                return res.status(200).send({
                    message: 'Usuario actualizado con exito',
                    status: 'success',
                    user: userUpdated
                });
            });
                
                 
            }); 
        }else{
            // Buscar y actualizar documento
            User.findOneAndUpdate({ _id: userId }, params, { new: true }, (err, userUpdated) => {
                
                if (err) {

                    return res.status(400).send({
                        message: 'Error al intentar actualizar  el usuario'
                    });
                } 

                if (!userUpdated) {

                    return res.status(500).send({
                        message: 'No se logro actualizar el usuario'
                    });
                }

                // Devolver respuesta
                return res.status(200).send({
                    message: 'Usuario actualizado con exito',
                    status: 'success',
                    user: userUpdated
                });
            });
        }

         
            
        
        
    },

    uploadAvatar: function(req,res){
        //Configurar el modulo multiparty(habilitar la subida de ficheros) -> routes/user.js

        // Recoger el fichero de la peticion
        var file_name ='Avatar no subido';

        // si no existe files
        if(!req.files){
        // Devolver respuesta
            return res.status(404).send({
                status: 'error',
                message: file_name
            });  
        }       
        // Conseguir el nombre y la extension del archivo
        var file_path = req.files.file0.path;
        var file_split = file_path.split('\\');

        // Si fuera mac o linux 
        //var file_split = file_path.split('/');
        
        //nombre del archivo
        var file_name = file_split[2];
        // extension
        var ext_split = file_name.split('\.');
        var file_ext = ext_split[1];

        // Comprobar extension solo imagenes, si no es valido borrar el archivo

        if(file_ext != 'png' && file_ext != 'jpg' && file_ext != 'jpeg' && file_ext != 'gif'){
            fs.unlink(file_path, (err)=>{
                return res.status(200).send({
                    status: 'error',
                    message: 'La extensión del archivo no es valida.',
                    ext: file_ext
                });
            });
        }else{
            // Sacar el id del usuario identificado
            var userId = req.user.sub;
            // Buscar y actualizar documento de la base de datos
            User.findOneAndUpdate({_id: userId}, {image: file_name}, {new: true}, (err, userUpdated)=>{
                if(err || !userUpdated){
                
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error al guardar el usuario'
                    });
                }
                // Devolver respuesta
                return res.status(200).send({
                    status: 'success',
                    message: 'Usuario actualizado',
                    user: userUpdated
                });
            });
        }

    },

    avatar:  function(req, res){
        var fileName = req.params.fileName;
        var pathFile = './uploads/users/'+fileName;

        fs.exists(pathFile, (exists)=>{
            if(exists){
                res.sendFile(path.resolve(pathFile));
            }else{
                return res.status(404).send({
                    status: 'error',
                    message: 'La imagen no existe'
                });
            }
        });
    },

    getUsers: function(req, res){
        User.find().exec((err, users)=>{
            if(err || !users){
                return res.status(404).send({
                    status: 'error',
                    message: 'No existen usuarios'
                });
            }

            return res.status(200).send({
                status: 'success',
                users
            });
        });
    },

    getUser: function(req, res){
        var userId = req.params.userId;

        User.findById(userId).exec((err, user)=>{
            if(err || !user){
                return res.status(404).send({
                    status: 'error',
                    message: 'No existe el usuario'
                });
            }

            return res.status(200).send({
                status: 'success',
                user
            });
        });
    }


};

module.exports = controller;