import bscrypt from "bcryptjs";
import { User } from "../models/index.js";
import { jwt } from "../utils/index.js";


//===========auth/register===================================================================
function register(req, res) {

  const { email, password } = req.body;

  const user = new User({
    email: email.toLowerCase(),
  });
  
  const salt = bscrypt.genSaltSync(10);
  const hashPassword = bscrypt.hashSync(password, salt);
  user.password = hashPassword;

  console.log("hash generado")
  console.log(hashPassword)

  user.save((error, userStorage) => {
    if (error) {
      console.log(error);
      res.status(400).send({ msg: "Error al registrar el usuario" });
    } else {
      res.status(201).send(userStorage);
    }
  });
}

//===========auth/login===================================================================
function login(req, res) {
  const { email, password } = req.body;
  console.log(req.body);

  const emailLowerCase = email.toLowerCase();

  //busca el usuario de manera inicial
  User.findOne({ email: emailLowerCase }, (error, userStorage) => {
    
    console.log("buscando por email::::")
    console.log(email)
    if (error) {
     
      res.status(500).send({ msg: "Error del servidor" });
    } else 
    {
      console.log("userStorage:::::::");
      console.log(userStorage);
      //console.log(error);
      console.log("---------------");

      //si no lo encuentra, regresa empty
      if(userStorage==null){
        res.status(200).send({ access: "",refresh:"" });
      }else{
          //si, si lo encuentra, le genera su token
          bscrypt.compare(password, userStorage.password, (bcryptError, check) => {
            if (bcryptError) {
            
              res.status(500).send({ msg: "Error del servidor" });
            } else if (!check) {
              
              res.status(400).send({ msg: "Contraseña incorrecta" });
            } else {

              let token = jwt.createAccessToken(userStorage);
              console.log("token:::::::::");
              console.log(token);
              res.status(200).send({
                access: token,  //token
                refresh: jwt.createRefreshToken(userStorage),
              });
            }
          });
    }

    }
  });
}

//===========================================================================================================
function getToken(req, res) {
  //const { userStorage } = req.body;
  console.log(req.body);

  //const emailLowerCase = email.toLowerCase();

    console.log("userStorage:::::::");
      console.log(req.body);
      //console.log(error);
      console.log("---------------");

      //si no lo encuentra, regresa empty
      res.status(200).send({
        access: jwt.createAccessToken(req.body),
        refresh: jwt.createRefreshToken(req.body),
      });
  
}

//===========================================================================================================
function refreshAccessToken(req, res) {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    res.status(400).send({ msg: "Token requerido" });
  }

  const hasExpired = jwt.hasExpiredToken(refreshToken);
  if (hasExpired) {
    res.status(400).send({ msg: "Token expirado" });
  }

  const { user_id } = jwt.decoded(refreshToken);

  User.findById(user_id, (error, userStorage) => {
    if (error) {
      res.status(500).send({ msg: "Error del servidor" });
    } else {
      res.status(200).send({
        accessToken: jwt.createAccessToken(userStorage),
      });
    }
  });
}
//===========================================================================================================
export const AuthController = {
  register,
  login,
  refreshAccessToken,
  getToken
};