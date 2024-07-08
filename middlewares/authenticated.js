import { jwt } from "../utils/index.js";

function asureAuth(req, res, next) {
  if (!req.headers.authorization) {
    return res
      .status(403)
      .send({ msg: "La peticion no tiene la cabecera de autenticación" });
  }

  const token = req.headers.authorization.replace("Bearer ", "");

  //console.log("token ingrsado")
 // console.log(token)
  try {
    const hasExpired = jwt.hasExpiredToken(token);

    if (hasExpired) {
      return res.status(400).send({ msg: "El token ha expirado" });
    }

    const payload = jwt.decoded(token);
    req.user = payload;

   // console.log("token payload")
  //console.log(payload)

    next();
  } catch (error) {
   // console.log("Token invalido")
    console.log(error)
    return res.status(400).send({ msg: "Token invalido" });
  }
}

export const mdAuth = {
  asureAuth,
};