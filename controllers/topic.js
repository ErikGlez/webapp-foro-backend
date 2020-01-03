'use strict'

var validator = require('validator');
var Topic = require('../models/topic');


var controller = {

   test: function(req, res) {
       return res.status(200).send({
         message: 'topic!!'
       });
       
   },

   save: function(req,res){

    // Recoger parametros por post
    var params = req.body;
    
    // Validar los datos
    try{

      var validate_title = !validator.isEmpty(params.title);
      var validate_content = !validator.isEmpty(params.title);
      var validate_lang = !validator.isEmpty(params.title);

    }catch(err){
      return res.status(200).send({
        message: 'Faltan datos por enviar'
      });
    }

    if( validate_title && validate_content && validate_lang){
      // Crear objeto a guardar
      var topic = new Topic();

      // Asignar valores
      topic.title = params.title;
      topic.content = params.content;
      topic.code = params.code;
      topic.lang = params.lang;
      topic.user = req.user.sub;

      // Guardar el topic
      topic.save((err, topicStored)=>{
          if(err || !topicStored){
            res.status(404).send({
              status: 'error',
              message: 'No ha sido posible guardar el topic'
            });
          }
        // devolver una respuesta
          return res.status(200).send({
            status: 'success',
            message: 'Topic guardado correctamente',
            topic: topicStored
          });
      });

      
    }else{
      return res.status(200).send({
        message: 'Datos no validos'
      });
    }
   },

   getTopics: function(req, res){
    // Cargar la libreria de paginación en la clase (modelo)
    // Recoger la pagina actual
    
    if(req.params.page == null || req.params.page ==0 || req.params.page == "0" || req.params.page == undefined || !req.params.page){
      page = 1;
    }else{
      var page = parseInt(req.params.page);
    }

    // Indicar las opciones de paginación
    var options = {
      sort: { date: -1 },
      populate:'user',
      limit: 5,
      page: page
    }
    // Find paginado
    Topic.paginate({},options, (err,topics)=>{
        // Devolver resultado(topics, total de topic, total de paginas)

        if(err){
          return res.status(500).send({
            status: 'error',
            message: 'Error al obtener los topics'
          });
        }

        if(!topics){
          return res.status(404).send({
            status: 'error',
            message: 'No fue posible obtener los topics'
          });
        }

        return res.status(200).send({
          status: 'success',
          topics: topics.docs,
          totalDocs: topics.totalDocs,
          totalPages: topics.totalPages
        });
    });
    
   },

   getTopicsByUser: function (req, res) {
    // Conseguir el id del usuario
    var userId = req.params.user;
    // find con la condicion del usuario
    Topic.find({
      user:userId
    }).sort([['date', 'descending']]).exec((err,topics)=>{
      if(err){
        return res.status(500).send({
          status: 'error',
          message: 'Error en la petición'
        });
      }
      if(!topics){
        return res.status(404).send({
          status: 'error',
          message: 'No hay topics para mostrar'
        });
      }
        // Devolver un resultado. 
        return res.status(200).send({
           status: 'success',
           topics
        });

    });
   
   },

   getTopic: function(req, res){
     // sacar el id del topic de la url
      var topicId = req.params.id;
     // find por id del topic
      Topic.findById(topicId).populate('user').exec((err, topic)=>{
        if(err){
          return res.status(500).send({
            status: 'error',
            message: 'Error al intentar obtener el topic'
          });
        }

        if(!topic){
          return res.status(404).send({
            status: 'error',
            message: 'No se encontro ningun topic'
          });
        }
        
        // Devolver un resultado. 
        return res.status(200).send({
          status: 'success',
          topic
        });
      });
    
   }

    
};

module.exports = controller;