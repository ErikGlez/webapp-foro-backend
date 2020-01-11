'use strict'

var validator = require('validator');
var Topic = require('../models/topic');

var controller ={

    add: function(req, res){

        // Recoger el id del topic de la url
        var topicId = req.params.topicId;

        //Find por id del topic de la url
        Topic.findById(topicId).exec((err,topic)=>{

            if(err){
                return res.status(500).send({
                    status: 'error',
                    message: 'Error en la petición'
                });
            }

            if(!topic){
                return res.status(404).send({
                    status: 'error',
                    message: 'No existe el topic'
                });
            }

            //Comprobar  objeto usuario y validar datos
            if(req.body.content){

                //validar datos
                try{
                    var validate_content = !validator.isEmpty(req.body.content);
                }catch(err){
                    return res.status(200).send({
                        message: 'No has comentado nada'
                    });
                }

                if(validate_content){
                    var comment ={
                        user: req.user.sub,
                        content: req.body.content
                    };
                    // Hacer el push en la propiedad del coment
                    topic.comments.push(comment);

                    //Guardar el topic completo
                    topic.save((err)=>{
                        if(err){
                            return res.status(500).send({
                                status: 'error',
                                message: 'Error al guardar el comentario'
                            });
                        }
                        //Devolver respuesta
                        return res.status(200).send({
                            status: 'success',
                            topic
                        });
                    });
                }else{
                    return res.status(200).send({
                        message: 'Los datos del comentario no son validos'
                    });
                }
            }else{
                    return res.status(400).send({
                        message: 'Faltan datos por enviar'
                    });
            }


        });
        
    },

    update: function(req, res){
        // conseguir el id del comentario que llega de la url
        var commentId = req.params.commentId;

        // recoger los datos que llegan por el body y validarlos
        var params = req.body;
        //validar datos
        try{
            var validate_content = !validator.isEmpty(params.content);
        }catch(err){
            return res.status(200).send({
                message: 'No has comentado nada'
            });
        }

        if(validate_content){
            // find and update de subdocumento 
            Topic.findOneAndUpdate(
                {"comments._id": commentId},
                {
                    "$set":{
                        "comments.$.content": params.content
                    }
                },
                {new:true},
                (err, topicUpdated)=>{

                    if(err){
                        return res.status(500).send({
                            status: 'error',
                            message: 'Error en la petición'
                        });
                    }

                    if(!topicUpdated){
                        return res.status(500).send({
                            status: 'error',
                            message: 'Error al actualizar el comentario'
                        });
                    }

                    // devolver los datos
                    return res.status(200).send({
                        status: 'success',
                        message: 'Comentario actualizado correctamente',
                        topic: topicUpdated
                    });
               
                });
            
        }else{
            return res.status(400).send({
                message: 'El comentario no es valido'
            });
        }

       
    },

    delete: function(req, res){

        // sacar el id del topic y del comentario a borrar que llega por url
        var topicId = req.params.topicId;
        var commentId = req.params.commentId;

        // buscar el topic
        Topic.findById(topicId, (err, topic)=>{
            if(err){
                return res.status(500).send({
                    status: 'error',
                    message: 'Error en la petición'
                });
            }

            if(!topic){
                return res.status(500).send({
                    status: 'error',
                    message: 'No existe el topic'
                });
            }
            
            // seleccionar el subdocumento(comentario)
            var comment = topic.comments.id(commentId);

            // borrar el comentario
            if(comment){
                comment.remove();
                 // guardar el topic
                topic.save((err)=>{
                    if(err){
                        return res.status(500).send({
                            status: 'error',
                            message: 'Error en la petición'
                        });
                    }

                    // devolver resultado
                    return res.status(200).send({
                        status: 'success',
                        message: "Comentario borrado correctamente",
                        topic
                    });
                });
                
            }else{
                return res.status(500).send({
                    message: 'No existe el comentario'
                });
            }
           
        });
       
    }
};

module.exports = controller;

