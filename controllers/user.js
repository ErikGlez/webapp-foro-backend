'use strict'
var validator = require('validator');
var bcrypt = require('bcrypt-nodejs');
var User =  require('../models/user');
var jwt = require('../services/jwt');
var controller = {

    probando: function (req, res){
        return res.status(200).send({
            message: "soy el metodo probando"
        });
    },

    testeando: function(req ,res){
        return res.status(200).send({
            message: "soy el metodo testeando"
        });
    },

    save: function(req, res){
        // Recoger los parametros de la peticion
        var params = req.body;
       
        // validar los datos
        var validate_name= !validator.isEmpty(params.name);
        var validate_surname= !validator.isEmpty(params.surname);
        var validate_email= !validator.isEmpty(params.email) && validator.isEmail(params.email);
        var validate_password= !validator.isEmpty(params.password);
       

        //console.log(validate_name, validate_surname, validate_email, validate_password);
        if(validate_name && validate_surname && validate_email && validate_password){

            // Crear objeto de usuarios
           var user = new User();

            // Asignar valores al usuario
            user.name = params.name;
            user.surname = params.surname;
            user.email = params.email.toLowerCase();
            user.role = 'ROLE_USER';
            user.image = null;

            // Comprobar si el usuario existe
            User.findOne({email: user.email}, (err, issetUser) => {
                if(err){
                    return res.status(500).send({
                        message: "Error al comprobar duplicidad de usuario"  
                    });
                }

                // Si no existe,
                if(!issetUser){
                    // Cifrar la contraseña
                    bcrypt.hash(params.password, null, null, (err, hash)=>{
                        user.password =hash;
                        // Guardar usuario
                        user.save((err, userStored)=>{
                            if(err){
                                return res.status(400).send({
                                    message: "Error al guardar el usuario"  
                                });
                            }

                            if(!userStored){
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
                   
                }else{
                    return res.status(400).send({
                        message: "El usuario ya esta registrado",
                       
                });
                }
            });
           
        }else{
            return res.status(400).send({
                message: "Los datos no son validos",
                
            });
        }
        
    },
    
    login: function(req, res){
        // Recoger los parametros de la petición
        var params = req.body;
        // Validar los datos
        var validate_email= !validator.isEmpty(params.email) && validator.isEmail(params.email);
        var validate_password= !validator.isEmpty(params.password);

        if(!validate_email  ||  !validate_password){
            return res.status(400).send({
                message: "Los datos son incorrectos"
            })
        }
        // Buscar usuarios que coincidan con el email
        User.findOne({email: params.email.toLowerCase()}, (err, user)=>{
            if(err){
                return res.status(500).send({
                    message: "Error al intentar identificarse"
                    
                })
            }

            if(!user){
                return res.status(400).send({
                    message: "El usuario no existe"
                })
            }
            // Si lo encuentra, 
            // comprobar la contraseña (coincidencia de email y password / bcrypt )
            bcrypt.compare(params.password, user.password, (err, check)=>{
                // si las credenciales coinciden
                if(check){
                    // Generar token de jwt y devolverlo (mas tarde)
                    if(params.gettoken){
                        //Devolver los datos
                        return res.status(200).send({
                            token: jwt.createToken(user)
                        });
                    }else{
                         // Limpiar el objeto antes de devolverlo
                        user.password = undefined;
                        // devolver los datos
                        return res.status(200).send({
                            message: "Usuario identificado", 
                            status: "success",
                            user
                        });
                    }

                   
                }else{
                    return res.status(400).send({
                        message: "La credenciales no coinciden"
                    })
                }
               

            });
        });
       
        
    }

};

module.exports = controller;