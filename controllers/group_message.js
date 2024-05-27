import { GroupMessage, Group } from "../models/index.js";
import { io, getFilePath } from "../utils/index.js";

//=================================================================================================================
function sendText(req, res) {

  const { group_id, message,tipo_cifrado,replied_message,forwarded } = req.body;
  
  const { user_id } = req.user;

  const group_message = new GroupMessage({
    group: group_id,
    user: user_id,
    message,
    type: "TEXT",
    tipo_cifrado:tipo_cifrado,
    email_replied:replied_message?.user?.email,
    message_replied:replied_message?.message,
    tipo_cifrado_replied:replied_message?.tipo_cifrado,
    forwarded:forwarded
  });

      group_message.save(async (error) => {

        if (error) {

          res.status(500).send({ msg: "Error del servidor" });

        } else {

          let  data = await group_message.populate(["user"]);

        
           

          console.log("==================GroupMessage===================");
          console.log(data);
          console.log("Enviando al grupo::::::")
          console.log(group_id)
          io.sockets.in(group_id).emit("message", data);
          io.sockets.in(`${group_id}_notify`).emit("message_notify", data);


         //get all members of the group
         const response = await Group.findById({ _id: group_id }).populate("participants");
         response.participants.forEach((userId) => {
           console.log("userId del grupo")
           console.log(userId._id.toString())
           console.log(user_id)
       
           if(userId._id.toString() !== user_id)
           io.sockets.in(userId._id.toString()).emit("pushing_notification", data);
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
    email_replied:replied_message?.user?.email,
    message_replied:replied_message?.message,
    tipo_cifrado_replied:replied_message?.tipo_cifrado,
    forwarded:true
  });

  group_message.save(async (error) => {

    if (error) {

      res.status(500).send({ msg: "Error del servidor" });

    } else {

      let  data = await group_message.populate(["user"]);

     
      console.log("==================GroupMessage===================");
      console.log(data);
      console.log("Enviando al grupo::::::"+group_id)
      io.sockets.in(group_id).emit("message", data);
      io.sockets.in(`${group_id}_notify`).emit("message_notify", data);
      
      



       //get all members of the group
       const response = await Group.findById({ _id: group_id }).populate("participants");
       response.participants.forEach((userId) => {
         console.log("userId del grupo")
         console.log(userId._id.toString())
         console.log(user_id)
     
         if(userId._id.toString() !== user_id)
         io.sockets.in(userId._id.toString()).emit("pushing_notification", data);
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
    email_replied:replied_message?.user?.email,
    message_replied:replied_message?.message,
    tipo_cifrado_replied:replied_message?.tipo_cifrado,
    forwarded:true
  });

  group_message.save(async (error) => {

    if (error) {

      res.status(500).send({ msg: "Error del servidor" });

    } else {

      let  data = await group_message.populate(["user"]);

     
      console.log("==================GroupMessage===================");
      console.log(data);
      console.log("Enviando al grupo::::::"+group_id)
      io.sockets.in(group_id).emit("message", data);
      io.sockets.in(`${group_id}_notify`).emit("message_notify", data);
      



       //get all members of the group
       const response = await Group.findById({ _id: group_id }).populate("participants");
       response.participants.forEach((userId) => {
         console.log("userId del grupo")
         console.log(userId._id.toString())
         console.log(user_id)
     
         if(userId._id.toString() !== user_id)
         io.sockets.in(userId._id.toString()).emit("pushing_notification", data);
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
  console.log(messageRef);
  messageRef.message=message;
  messageRef.tipo_cifrado=tipo_cifrado;
  console.log("==============================");
  console.log(messageRef);

  GroupMessage.findByIdAndUpdate({ _id: idMessage }, messageRef, (error) => {
    if (error) {
      res.status(400).send({ msg: "Error al actualizar el mensaje" });
    } else {
      //io.sockets.in(group_id).emit("reloadmsgs", true);
      res.status(201).send(messageRef);
    }
  });

}

async function sendTextEditado(req, res) {

  const { group_id, message,tipo_cifrado,idMessage } = req.body;
  
  const { user_id } = req.user;

  const messageRef = await GroupMessage.findById({ _id: idMessage }).populate("user");
  console.log(messageRef);
  messageRef.message=message;
  messageRef.tipo_cifrado=tipo_cifrado;
  console.log("==============================");
  console.log(messageRef);

  GroupMessage.findByIdAndUpdate({ _id: idMessage }, messageRef, (error) => {
    if (error) {
      res.status(400).send({ msg: "Error al actualizar el mensaje" });
    } else {
      io.sockets.in(group_id).emit("reloadmsgs", true);
      res.status(201).send(messageRef);
    }
  });

}

//=================================================================================================================
async function deleteMessage(req, res) {

  const { group_id,idMessage } = req.body;
  
  const { user_id } = req.user;

  //const messageRef = await GroupMessage.findById({ _id: idMessage });
  //console.log(messageRef);
  
  GroupMessage.findByIdAndDelete( {_id: idMessage}, (error) => {
    if (error) {
      console.log(error);
      res.status(400).send({ msg: "Error al eliminar el chat" });
    } else {
      io.sockets.in(group_id).emit("reloadmsgs", true);
      res.status(201).send({ msg: "Mensaje eliminado" });
    }
  });

}

//=================================================================================================================
function sendImage(req, res) {

  const { group_id } = req.body;
  const { user_id } = req.user;

console.log("receiving image in server...")
  const group_message = new GroupMessage({
    group: group_id,
    user: user_id,
    message: getFilePath(req.files.image),
    type: "IMAGE",
  });

  console.log(group_message);
  
  group_message.save(async (error) => {

    if (error) {

      res.status(500).send({ msg: "Error del servidor" });

    } else {

      const data = await group_message.populate("user");

      io.sockets.in(group_id).emit("message", data);
      io.sockets.in(`${group_id}_notify`).emit("message_notify", data);



       //get all members of the group
       const response = await Group.findById({ _id: group_id }).populate("participants");
       response.participants.forEach((userId) => {
         console.log("userId del grupo")
         console.log(userId._id.toString())
         console.log(user_id)
     
         if(userId._id.toString() !== user_id)
         io.sockets.in(userId._id.toString()).emit("pushing_notification", data);
       });



      res.status(201).send({});

    }
  });
}

//=================================================================================================================
function sendFile(req, res) {

  const { group_id } = req.body;
  const { user_id } = req.user;

console.log("receiving file in server...")
  const group_message = new GroupMessage({
    group: group_id,
    user: user_id,
    message: getFilePath(req.files.file),
    type: "FILE",
  });

  console.log(group_message);
  
  group_message.save(async (error) => {

    if (error) {

      res.status(500).send({ msg: "Error del servidor" });

    } else {

      const data = await group_message.populate("user");

      io.sockets.in(group_id).emit("message", data);
      io.sockets.in(`${group_id}_notify`).emit("message_notify", data);




       //get all members of the group
       const response = await Group.findById({ _id: group_id }).populate("participants");
       response.participants.forEach((userId) => {
         console.log("userId del grupo")
         console.log(userId._id.toString())
         console.log(user_id)
     
         if(userId._id.toString() !== user_id)
         io.sockets.in(userId._id.toString()).emit("pushing_notification", data);
       });
       

      res.status(201).send({});
      //res.status(201).send(data);
      

    }
  });
}
//=================================================================================================================
async function getAll(req, res) {

  const { group_id } = req.params;

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
  getTotalMessages,
  getLastMessage,
};