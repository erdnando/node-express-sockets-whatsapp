import { Group, User } from "../models/index.js";
import { getFilePath } from "../utils/index.js";


//============================================================================================================
async function getMe(req, res) {
  const { user_id } = req.user;

  //console.log("req.user")
  //console.log(req.user)
  

  try {
   // console.log(req.user)
   // console.log("buscando por:::::::::user_id");
   // console.log(user_id);

    //get user data without -password
    const response = await User.findById(user_id).select(["-password"]);

    //console.log("response:::::::");
   // console.log(response);



    if (!response ) {
      res.status(400).send({ msg: "No se ha encontrado el usuario" });
    } else {
      res.status(200).send(response);
    }
  } catch (error) {
    res.status(500).send({ msg: "Error del servidor" });
  }
}

//============================================================================================================
async function getUsers(req, res) {
  try {
    const { user_id } = req.user;
    // get users without password and without the connected user
    const users = await User.find({ _id: { $ne: user_id } }).select([
      "-password",
    ]);

    if (!users) {
      res.status(400).send({ msg: "No se han encontrado usuarios" });
    } else {
      res.status(200).send(users);
    }
  } catch (error) {
    res.status(500).send({ msg: "Error del servidor" });
  }
}

async function getAllUsers(req, res) {
  try {
    const { user_id } = req.user;
    // get users without password and without the connected user
    const users = await User.find();

    if (!users) {
      res.status(400).send({ msg: "No se han encontrado usuarios" });
    } else {
      res.status(200).send(users);
    }
  } catch (error) {
    res.status(500).send({ msg: "Error del servidor" });
  }
}

//============================================================================================================
async function getUser(req, res) {
  const { id } = req.params;
  //console.log("==============");
 // console.log(id);
 // console.log(req.user);
 // console.log(req.params);

  try {
    const response = await User.findById(id).select(["-password"]);

    if (!response) {
      res.status(400).send({ msg: "No se ha encontrado el usuario (getuser)" });
    } else {
      res.status(200).send(response);
    }
  } catch (error) {
    res.status(500).send({ msg: "Error del servidor" });
  }
}

//=================================================================================================================================
async function getAlias(req, res) {
  const { alias } = req.params;
  //console.log("==============");
 // console.log(alias.toLowerCase());
  //console.log(req.user);
  //console.log(req.params);

  try {
    const response = await User.find({firstname:alias.toLowerCase() });

    if (!response) {
      res.status(400).send({ msg: "No se ha encontrado el alias (getAlias)." });
    } else {

     // console.log("response")
     // console.log(response)
      res.status(200).send(response);
    }
  } catch (error) {
    res.status(500).send({ msg: "Error del servidor." });
  }
}

//============================================================================================================
async function updateUser(req, res) {
  const { user_id } = req.user;
  //get complete body with file
  const userData = req.body;
  console.log("Actualizando user data");
  console.log(req.body);

  if (req.files.avatar) {
    const imagePath = getFilePath(req.files.avatar);
    //updatind file and set string reference instead
    //middleware created file in to uploads folder previously
    userData.avatar = imagePath;
  }

  User.findByIdAndUpdate({ _id: user_id }, userData, (error) => {
    if (error) {
      res.status(400).send({ msg: "Error al actualizar el usuario" });
    } else {
      res.status(200).send(userData);
    }
  });
}

//============================================================================================================
async function getUsersExeptParticipantsGroup(req, res) {
  const { group_id } = req.params;

  const group = await Group.findById(group_id);
  const participantsStrings = group.participants.toString();
  const participants = participantsStrings.split(",");
  //console.log("participants")
 // console.log(participants)
  //console.log("group_id")
  console.log(group_id)
//
  const response = await User.find({ _id: { $nin: participants } }).select([
    "-password",
  ]);

  if (!response) {
    res.status(400).sedn({ msg: "No se ha encontrado ningun usuario" });
  } else {
    res.status(200).send(response);
  }
}

//============================================================================================================

export const UserController = {
  getMe,
  getUsers,
  getUser,
  getAlias,
  updateUser,
  getUsersExeptParticipantsGroup,
  getAllUsers
};