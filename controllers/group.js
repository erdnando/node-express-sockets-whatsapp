import { User, Group, GroupMessage } from "../models/index.js";
import { io, getFilePath } from "../utils/index.js";


//===========================================================================================================================
function create(req, res) {

  const { user_id } = req.user;
  const group = new Group(req.body);

  console.log(req.body);
  group.creator = user_id;

  let justCreator = false;
  let arrParticipantesAux =JSON.parse(req.body.participants);
  if(arrParticipantesAux.length==1 && arrParticipantesAux[0]==user_id )justCreator=true;


  group.participants = justCreator ? [] : JSON.parse(req.body.participants);
  group.participants = [...group.participants, user_id];

  if (req.files.image) {
    const imagePath = getFilePath(req.files.image);
    group.image = imagePath;
  }

  group.save((error, groupStorage) => {
    if (error) {
      res.status(500).send({ msg: "Error del servidor" });
    } else {
      if (!groupStorage) {
        res.status(400).send({ msg: "Error al crear el grupo" });
      } else {
        res.status(201).send(groupStorage);
      }
    }
  });
}

//=======================================================================================
function createAuto(req, res) {

  const { user_id } = req.user;
  const group = new Group(req.body);

  group.creator = user_id;
  group.participants = [];//JSON.parse(req.body.participants); 
  group.participants = [...group.participants, user_id];
  group.image = "group/group1.png";

  console.log("group creado automatico:::::::");
  console.log(group);
  

  group.save((error, groupStorage) => {
    if (error) {
      res.status(500).send({ msg: "Error del servidor" });
    } else {
      if (!groupStorage) {
        res.status(400).send({ msg: "Error al crear el grupo" });
      } else {
        res.status(201).send(groupStorage);
      }
    }
  });
}

//===========================================================================================================================
function getAll(req, res) {
console.log("getAll");
  const { user_id } = req.user;

  console.log("user_id",user_id);

  Group.find({ participants: user_id })
    .populate("creator")
    .populate("participants")
    .exec(async (error, groups) => {
      if (error) {
        res.status(500).send({ msg: "Error al obtener los grupos" });
      }

      const arrayGroups = [];
      for await (const group of groups) {

        const response = await GroupMessage.findOne({ group: group._id }).sort({ createdAt: -1, });

        arrayGroups.push({
          ...group._doc,
          last_message_date: response?.createdAt || null,
        });
      }

      res.status(200).send(arrayGroups);
    });
}

//===========================================================================================================================
function getGroup(req, res) {
  const group_id = req.params.id;

  Group.findById(group_id, (error, groupStorage) => {
    if (error) {
      res.status(500).send({ msg: "Error del servidor" });
    } else if (!groupStorage) {
      res.status(400).send({ msg: "No se ha encontrado el grupo" });
    } else {
      res.status(200).send(groupStorage);
    }
  }).populate("participants");
}

//======================================here=====================================================================================

async function getGroupParticipants(req, res) {
  const group_id = req.params.id;

  try {

    const response = await Group.findById({ _id: group_id }).populate("participants");
   // const myJSON = response.participants.length; 
    //console.log(myJSON);
    res.status(200).send(JSON.stringify(response.participants.length));

  } catch (error) {
    console.log(error);
    res.status(500).send({ msg: "Error del servidor al consultar el count de participantes" });
  }

}

//===========================================================================================================================
async function updateGroup(req, res) {
  const { id } = req.params;
  const { name } = req.body;

  const group = await Group.findById(id);

  //si el nombre se modifica, se asigna
  if (name) group.name = name;
  //si la imagen existe se asocia el path
  if (req.files.image) {
    const imagePath = getFilePath(req.files.image);
    group.image = imagePath;
  }

  //updating group
  Group.findByIdAndUpdate(id, group, (error) => {
    if (error) {
      res.status(500).send({ msg: "Error del servidor" });
    } else {
      res.status(200).send({ image: group.image, name: group.name });
    }
  });
}

//===========================================================================================================================
async function exitGroup(req, res) {

  const { id } = req.params;//id del grupo
  const { user_id } = req.user;//id del usuario q quiere salir de un grupo

  const group = await Group.findById(id);

  //filtrando lista de participantes menos el usuario q se esta saliendo
  const newParticipants = group.participants.filter(
    (participant) => participant.toString() !== user_id
  );

  const newData = {
    ...group._doc,
    participants: newParticipants,
  };

  await Group.findByIdAndUpdate(id, newData);

  res.status(200).send({ msg: "Salida exitosa" });
}

//===========================================================================================================================
async function addParticipants(req, res) {

  const { id } = req.params;
  const { users_id } = req.body;

  const group = await Group.findById(id);
  const users = await User.find({ _id: users_id });

  console.log(users_id);

  const arrayObjectIds = [];

  users.forEach((user) => {
    arrayObjectIds.push(user._id);
  });

  const newData = {
    ...group._doc,
    participants: [...group.participants, ...arrayObjectIds],
  };

  await Group.findByIdAndUpdate(id, newData);


  //new
  arrayObjectIds.forEach((user_id) => {
    console.log("user_id invitado")
    console.log(user_id.toString())
    //console.log(JSON.stringify(user_id))
    console.log("datos dle grupo")
    console.log(newData)
  // io.sockets.in(`${user_id.toString()}_ref`).emit("message_invite", newData);
   io.sockets.in(user_id.toString()).emit("message_invite", newData);
  });

  res.status(200).send({ msg: "Participantes añadidos correctamente" });
}

//===========================================================================================================================
async function banParticipant(req, res) {

  const { group_id, user_id } = req.body;

  const group = await Group.findById(group_id);

  const newParticipants = group.participants.filter(
    (participant) => participant.toString() !== user_id
  );

  const newData = {
    ...group._doc,
    participants: newParticipants,
  };

  await Group.findByIdAndUpdate(group_id, newData);

  res.status(200).send({ msg: "Baneo con existo" });
}

//===========================================================================================================================


export const GroupController = {
  create,
  createAuto,
  getAll,
  getGroup,
  updateGroup,
  exitGroup,
  addParticipants,
  banParticipant,
  getGroupParticipants
};