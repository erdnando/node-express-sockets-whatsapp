import { GroupMessage, Group } from "../models/index.js";
import { io, getFilePath } from "../utils/index.js";

//=================================================================================================================

async function notify_read(req, res) {

    console.log("notify_read")
    const { idUser, group_id } = req.body;

   // console.log("Trabajando con el idMsg::", idMsg)
    console.log("Trabajando con el group_id: ",group_id);
    //idUser --> es el q lo leyo
    //const { user_id } = req.user;//el q avisa q alguien lo lleyo
    console.log("idUser que leyo el mensaje:::");
    console.log(idUser.toString());

    //get number of member in this group
    const groupParticipants = await Group.findById({ _id: group_id }).populate("participants");
    const numParticipantes = groupParticipants.participants.length; 
    console.log("numParticipantes:",numParticipantes);

    //getting all messages of this group
    const messagesGroup= await GroupMessage.find({ group: group_id });
    console.log("obteniendo mensajes del grupo")
    //console.log(messagesGroup)

    //---------------------------------------------------------------------------------------------
  
    let msgAux="";
    let coincidencia=false;
    let aux_lectores_message="";
    let arrResponse = [];

    try{
      //if(grupoAbierto == group_id){
          //looping them & evaluate reader counters
          
          messagesGroup.forEach((msgx) => {

            if( msgx.estatus != "LEIDO"){
                  console.log("looping messagesGroup")
                  msgAux=msgx.message;
                  aux_lectores_message=msgx.lectores_message;

                  coincidencia = aux_lectores_message.includes(idUser.toString());
                  console.log("coincidencia");
                  console.log(coincidencia);

                  if(coincidencia == false){
                    aux_lectores_message= aux_lectores_message+idUser.toString()+',';
                    //console.log("anadiendo userid a la lista de leidos:",idUser.toString());
                  }
                  
                  const numeroVistos = (aux_lectores_message).split(',');
                  console.log("numeroVistos:",numeroVistos.length-1);

                  //compare number of mebers vs lecrtores_message split -1
                  if( (numeroVistos.length-1) == numParticipantes){
                    msgx.estatus="LEIDO";
                  }
                  else{
                    msgx.estatus="NOLEIDO";
                  }

                  arrResponse.push({idMsg:msgx._id, estatus: msgx.estatus});

                  //console.log(" msgx.estatus:", msgx.estatus);
                  msgx.lectores_message = aux_lectores_message;
                  console.log("msgx.lectores_messages: ",aux_lectores_message);
                  //-----------------------------------------------------

                      GroupMessage.findByIdAndUpdate({ _id: msgx._id }, msgx, (error) => {
                        if (error) {
                          console.log("Crashing kere!!!")
                          console.log(error)
                        }else{
                          console.log("msg actualizado, estatus y lectores_messages");
                        }
                      }); 
                      console.log("==========================iteration==========================");
            }else{
              arrResponse.push({idMsg:msgx._id, estatus: msgx.estatus});
            }
          });//end foreach messages

         //emit to members of a group
          const data={ message:msgAux+"-"+idUser.toString(), group_id:group_id, arrResponse:arrResponse };
          console.log("Enviando a socket updateSeen:");
          io.sockets.in(`${group_id}_seen`).emit("updateSeen", data);
        //===================================================================
    
      res.status(201).send(true);
    }catch(err){
        res.status(400).send({ msg: "Error al actualizar mensajes en estado LEIDO"+ err });
    }
}

function sendText(req, res) {

  //console.log("sendText:::::::::::::::::::::::::::::::::::::::::::::")
  const { group_id, message,tipo_cifrado,replied_message,forwarded } = req.body;
  
  const { user_id } = req.user;//user who send the message

  const group_message = new GroupMessage({
    group: group_id,
    user: user_id,
    message,
    type: "TEXT",
    tipo_cifrado:tipo_cifrado,
    email_replied:replied_message?.user?.firstname == "" ? replied_message?.user?.email: replied_message?.user?.firstname,
    message_replied:replied_message?.message,
    tipo_cifrado_replied:replied_message?.tipo_cifrado,
    forwarded:forwarded,
    estatus:"NOLEIDO",
    lectores_message:user_id.toString()+",",
    edited_message:false
  });

      group_message.save(async (error) => {

        if (error) {
          res.status(500).send({ msg: "Error del servidor" });
        } else {
          let  data = await group_message.populate(["user"]);

         //get all members of the group
         const response = await Group.findById({ _id: group_id }).populate("participants");

         response.participants.forEach((userId) => {

           console.log(io.sockets.adapter.rooms)
            //Envia push notification a los miembros del grupo, menos al que lo origino
            if(userId._id.toString() !== user_id){
              console.log("emitiendo a (members):", userId._id.toString())
             
              io.sockets.in(userId._id.toString()).emit("newMessagex", data);
             // io.sockets.in(userId._id.toString()).emit("pushing_notification", data);
              io.sockets.in(`${userId._id.toString()}_notify`).emit("pushing_notification", {"message": userId._id.toString()});
            }
           //Envia push notification al que lo origino
            if(userId._id.toString() == user_id){
              console.log("emitiendo a (owner):", userId._id.toString());
              io.sockets.in(userId._id.toString()).emit("newMessagex_me", data);
            }
         });

          res.status(201).send({});

        }
      });

}

function sendTextForwardedImage(req, res) {

  const { group_id, message,tipo_cifrado,replied_message,forwarded } = req.body;
  
  const { user_id } = req.user;

  const group_message = new GroupMessage({
    group: group_id,
    user: user_id,
    message,
    type: "IMAGE",
    tipo_cifrado:tipo_cifrado,
    //email_replied:replied_message?.user?.email,
    email_replied:replied_message?.user?.firstname == "" ? replied_message?.user?.email: replied_message?.user?.firstname,
    message_replied:replied_message?.message,
    message_replied:replied_message?.message,
    tipo_cifrado_replied:replied_message?.tipo_cifrado,
    forwarded:true,
    estatus:"NOLEIDO",
    lectores_message:user_id.toString()+",",
    edited_message:false
  });

  group_message.save(async (error) => {

    if (error) {

      res.status(500).send({ msg: "Error del servidor" });

    } else {

      let  data = await group_message.populate(["user"]);

     
    //  console.log("==================GroupMessage===================");
    //  console.log(data);
    //  console.log("Enviando al grupo::::::"+group_id)
     
      
       //get all members of the group
       const response = await Group.findById({ _id: group_id }).populate("participants");
       response.participants.forEach((userId) => {
        // console.log("userId del grupo")
        // console.log(userId._id.toString())
        // console.log(user_id)
     
         //if(userId._id.toString() !== user_id)
      
          //Envia push notification a los miembros del grupo, menos al que lo origino
          if(userId._id.toString() !== user_id){
           // console.log("emitiendo a:", userId._id.toString())
           io.sockets.in(userId._id.toString()).emit("newMessagex", data);
           io.sockets.in(`${userId._id.toString()}_notify`).emit("pushing_notification", {"message": userId._id.toString()});
          }
         //Envia push notification al que lo origino
          if(userId._id.toString() == user_id){
           // console.log("emitiendo a:", userId._id.toString())
            io.sockets.in(userId._id.toString()).emit("newMessagex_me", data);
          }
       });

      res.status(201).send({});

    }
  });
}

function sendTextForwardedFile(req, res) {

  const { group_id, message,tipo_cifrado,replied_message,forwarded } = req.body;
  
  const { user_id } = req.user;

  const group_message = new GroupMessage({
    group: group_id,
    user: user_id,
    message,
    type: "FILE",
    tipo_cifrado:tipo_cifrado,
    //email_replied:replied_message?.user?.email,
    email_replied:replied_message?.user?.firstname == "" ? replied_message?.user?.email: replied_message?.user?.firstname,
    message_replied:replied_message?.message,
    message_replied:replied_message?.message,
    tipo_cifrado_replied:replied_message?.tipo_cifrado,
    forwarded:true,
    estatus:"NOLEIDO",
    lectores_message:user_id.toString()+",",
    edited_message:false
  });

  group_message.save(async (error) => {

    if (error) {

      res.status(500).send({ msg: "Error del servidor" });

    } else {

      let  data = await group_message.populate(["user"]);

     
      //console.log("==================GroupMessage===================");
      //console.log(data);
     // console.log("Enviando al grupo::::::"+group_id)
      //io.sockets.in(group_id).emit("message", data);
      //io.sockets.in(`${group_id}_notify`).emit("message_notify", data);
      
       //get all members of the group
       const response = await Group.findById({ _id: group_id }).populate("participants");
       response.participants.forEach((userId) => {
        // console.log("userId del grupo")
        // console.log(userId._id.toString())
        // console.log(user_id)
     
         //if(userId._id.toString() !== user_id)
        
          //Envia push notification a los miembros del grupo, menos al que lo origino
          if(userId._id.toString() !== user_id){
           // console.log("emitiendo a:", userId._id.toString())
           io.sockets.in(userId._id.toString()).emit("newMessagex", data);
           io.sockets.in(`${userId._id.toString()}_notify`).emit("pushing_notification", {"message": userId._id.toString()});
          }
         //Envia push notification al que lo origino
          if(userId._id.toString() == user_id){
           // console.log("emitiendo a:", userId._id.toString())
            io.sockets.in(userId._id.toString()).emit("newMessagex_me", data);
          }
       });

      res.status(201).send({});

    }
  });
}
//=================================================================================================================

async function sendTextUpdateCrypt(req, res) {

  const { group_id, message,tipo_cifrado,idMessage } = req.body;
  
  const { user_id } = req.user;

  const messageRef = await GroupMessage.findById({ _id: idMessage }).populate("user");
  //console.log(messageRef);
  messageRef.message=message;
  messageRef.tipo_cifrado=tipo_cifrado;
 // console.log("==============================");
 // console.log(messageRef);

  GroupMessage.findByIdAndUpdate({ _id: idMessage }, messageRef, async (error) => {
    if (error) {
      res.status(400).send({ msg: "Error al actualizar el mensaje" });
    } else {
      //io.sockets.in(group_id).emit("reloadmsgs", true);
      //-----------------sending delete notification all members=========================
      //get all members of the group
      const response =  await Group.findById({ _id: group_id }).populate("participants");
      response.participants.forEach((userId) => {

         //Envia push notification a los miembros del grupo, menos al que lo origino
         if(userId._id.toString() !== user_id){
          // console.log("emitiendo a:", userId._id.toString())
           io.sockets.in(userId._id.toString()).emit("reloadmsgs",  {"group_id":group_id,"idMessage":idMessage, "message":message});
         }
        //Envia push notification al que lo origino
         if(userId._id.toString() == user_id){
          // console.log("emitiendo a:", userId._id.toString())
           io.sockets.in(userId._id.toString()).emit("reloadmsgs",  {"group_id":group_id,"idMessage":idMessage, "message":message});
         }
      });
      //===============================================================================
      res.status(201).send({ msg: "Mensaje eliminado" });
    }
    
  });

}

async function sendTextEditado(req, res) {

  const { group_id, message,tipo_cifrado,idMessage } = req.body;
  
  const { user_id } = req.user;

  const messageRef = await GroupMessage.findById({ _id: idMessage }).populate("user");
 // console.log(messageRef);
  messageRef.message=message;
  messageRef.tipo_cifrado=tipo_cifrado;
  messageRef.edited_message=true;
 // console.log("==============================");
 // console.log(messageRef);

  GroupMessage.findByIdAndUpdate({ _id: idMessage }, messageRef, (error) => {
    if (error) {
      res.status(400).send({ msg: "Error al actualizar el mensaje" });
    } else {
     // io.sockets.in(group_id).emit("reloadmsgs", true);

      //emit to members of a group
      const data={ message:message+"-"+user_id.toString(), group_id:group_id, arrResponse:[] };
      console.log("Enviando a socket updateSeen:");
      io.sockets.in(`${group_id}_seen`).emit("updateSeen", data);
      res.status(201).send(messageRef);
    }
  });

}

//=================================================================================================================
async function deleteMessage(req, res) {

  const { group_id,idMessage,message } = req.body;
  
  const { user_id } = req.user;

  //const messageRef = await GroupMessage.findById({ _id: idMessage });
  console.log("message a borrar:");
  console.log(message);
  
  GroupMessage.findByIdAndDelete( {_id: idMessage}, async (error) => {
    if (error) {
      console.log(error);
      res.status(400).send({ msg: "Error al eliminar el chat" });
    } else {
      //io.sockets.in(group_id).emit("reloadmsgs", true);
      //-----------------sending delete notification all members=========================
      //get all members of the group
      const response =  await Group.findById({ _id: group_id }).populate("participants");
      response.participants.forEach((userId) => {
     
         //Envia push notification a los miembros del grupo, menos al que lo origino
         if(userId._id.toString() !== user_id){
           console.log("emitiendo a:", userId._id.toString())
           io.sockets.in(userId._id.toString()).emit("refreshDelete",  {"group_id":group_id,"idMessage":idMessage, "message":message});
         }
        //Envia push notification al que lo origino
         if(userId._id.toString() == user_id){
           console.log("emitiendo a:", userId._id.toString())
           io.sockets.in(userId._id.toString()).emit("refreshDelete",  {"group_id":group_id,"idMessage":idMessage, "message":message});
         }
      });
      //===============================================================================
      res.status(201).send({ msg: "Mensaje eliminado" });
    }
  });

}

//=================================================================================================================
function sendImage(req, res) {

  const { group_id } = req.body;
  const { user_id } = req.user;

//console.log("receiving image in server...")
  const group_message = new GroupMessage({
    group: group_id,
    user: user_id,
    message: getFilePath(req.files.image),
    type: "IMAGE",
    estatus:"NOLEIDO",
    lectores_message:user_id.toString()+",",
    edited_message:false
  });

  //console.log(group_message); 

  group_message.save(async (error) => {

    if (error) {

      res.status(500).send({ msg: "Error del servidor" });

    } else {

      const data = await group_message.populate("user");

      
       //get all members of the group
       const response = await Group.findById({ _id: group_id }).populate("participants");
       response.participants.forEach((userId) => {
       //  console.log("userId del grupo")
       //  console.log(userId._id.toString())
       //  console.log(user_id)
     
         //if(userId._id.toString() !== user_id)
        
          //Envia push notification a los miembros del grupo, menos al que lo origino
          if(userId._id.toString() !== user_id){
            //console.log("emitiendo a:", userId._id.toString())
            io.sockets.in(userId._id.toString()).emit("newMessagex", data);
            io.sockets.in(`${userId._id.toString()}_notify`).emit("pushing_notification", {"message": userId._id.toString()});
          }
         //Envia push notification al que lo origino
          if(userId._id.toString() == user_id){
           // console.log("emitiendo a:", userId._id.toString())
            io.sockets.in(userId._id.toString()).emit("newMessagex_me", data);
          }
       });

      res.status(201).send({});

    }
  });
}

//=================================================================================================================
function sendFile(req, res) {

  const { group_id } = req.body;
  const { user_id } = req.user;

//console.log("receiving file in server...")
  const group_message = new GroupMessage({
    group: group_id,
    user: user_id,
    message: getFilePath(req.files.file),
    type: "FILE",
    estatus:"NOLEIDO",
    lectores_message:user_id.toString()+",",
    edited_message:false
  });

 // console.log(group_message);  

  group_message.save(async (error) => {

    if (error) {

      res.status(500).send({ msg: "Error del servidor" });

    } else {

      const data = await group_message.populate("user");

      //io.sockets.in(group_id).emit("message", data);
      //io.sockets.in(`${group_id}_notify`).emit("message_notify", data);

       //get all members of the group


          const response = await Group.findById({ _id: group_id }).populate("participants");
          response.participants.forEach((userId) => {
           // console.log("userId del grupo")
          //  console.log(userId._id.toString())
          //  console.log(user_id)
        
            //if(userId._id.toString() !== user_id)
           
             //Envia push notification a los miembros del grupo, menos al que lo origino
             if(userId._id.toString() !== user_id){
            //  console.log("emitiendo a:", userId._id.toString())
            io.sockets.in(userId._id.toString()).emit("newMessagex", data);
            io.sockets.in(`${userId._id.toString()}_notify`).emit("pushing_notification", {"message": userId._id.toString()});
            }
           //Envia push notification al que lo origino
            if(userId._id.toString() == user_id){
             // console.log("emitiendo a:", userId._id.toString())
              io.sockets.in(userId._id.toString()).emit("newMessagex_me", data);
            }

          });

      res.status(201).send({});
    }
  });
}
//=================================================================================================================

async function getFiltered(req, res) {

  const { group_id, fecha } = req.params;

 // console.log(group_id)
 // console.log(fecha)
 // console.log(fecha === undefined)

  let messages=undefined;
  let total=undefined;
  try {
    if(fecha === "undefined" || fecha === "undefined" || fecha === null){
      //console.log("sin fecha")
      //filtered by group
       messages = await GroupMessage.find({ group: group_id })
      .sort({ createdAt: 1 })
      .populate("user");

       total = await GroupMessage.find({ group: group_id }).count();

    }else{
      //console.log("con fecha")
       messages = await GroupMessage.find({ group: group_id, createdAt: { $gte: new Date(fecha).toISOString()  }   })
      .sort({ createdAt: 1 })
      .populate("user");

       total = await GroupMessage.find({group: group_id, createdAt:{ $gte: new Date(fecha).toISOString()  }   }).count();
    }
    

    

    res.status(200).send({ messages, total });

  } catch (error) {
    console.log(error)
    res.status(500).send({ msg: "Error del servidor" });
  }
}

async function getAll(req, res) {

  const { group_id } = req.params;
  //console.log(group_id)

  try {
    const messages = await GroupMessage.find({ group: group_id })
      .sort({ createdAt: 1 })
      .populate("user");

    const total = await GroupMessage.find({ group: group_id }).count();

    res.status(200).send({ messages, total });

  } catch (error) {
    res.status(500).send({ msg: "Error del servidor" });
  }
}


async function updateMessageGroup(req, res) {

  const { group_id } = req.params;
 // console.log("Actualizando estatus del grupo:::")
 // console.log(group_id)

  try {
    //const messages = await GroupMessage.find({ group: group_id });

    GroupMessage.updateMany({group: group_id }, {estatus: 'LEIDO'}, (error) => {
      if (error) {
        res.status(400).send({ msg: "Error al actualizar estatus de LEIDO" });
      } else {
        res.status(201).send(true);
      }
    });

  } catch (error) {
    res.status(500).send({ msg: "Error del servidor" });
  }
}

//=================================================================================================================
async function getTotalMessages(req, res) {

  const { group_id } = req.params;

  try {
    const total = await GroupMessage.find({ group: group_id }).count();

    res.status(200).send(JSON.stringify(total));

  } catch (error) {
    res.status(500).send({ msg: "Error del servidor" });
  }

}
//=================================================================================================================
async function getLastMessage(req, res) {

  const { group_id } = req.params;

  try {
    
    const response = await GroupMessage.findOne({ group: group_id })
      .sort({ createdAt: -1 })
      .populate("user");

    res.status(200).send(response || {});

  } catch (error) {
    res.status(500).send({ msg: "Error del servidor" });
  }
}
//=================================================================================================================

export const GroupMessageController = {
  sendText,
  sendTextForwardedImage,
  sendTextForwardedFile,
  sendTextEditado,
  sendTextUpdateCrypt,
  sendFile,
  deleteMessage,
  sendImage,
  getAll,
  updateMessageGroup,
  getFiltered,
  getTotalMessages,
  getLastMessage,
  notify_read
};