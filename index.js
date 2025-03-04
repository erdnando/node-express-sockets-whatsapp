import mongoose from "mongoose";
import { server } from "./app.js";
import { IP_SERVER, PORT, DB_USER, DB_PASSWORD, DB_HOST } from "./constants.js";
import { io } from "./utils/index.js";


mongoose.set("strictQuery", false);

const mongoDbUrl = `mongodb+srv://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/`;

const mongoDbLocal = "mongodb://192.168.0.34:27017/chatapp";

mongoose.connect(mongoDbUrl, (error) => {
  if (error) throw error;

  server.listen(PORT, () => {
    console.log("#####################################");
    console.log("###### API REST SECURE CHAT MX ######");
    console.log("#####################################");
    console.log(`http://${IP_SERVER}:${PORT}/api`);

    io.sockets.on("connection", (socket) => {
      console.log("NUEVO USUARIO CONECTADO");

      socket.on("disconnect", () => {
        console.log("USUARIO DESCONECTADO");
      });

      socket.on("subscribe", (room) => {
       // console.log("=================================");
       // console.log("subscribe channel de: usuario");
       // console.log(room);
       // console.log("=================================");
        socket.join(room);
        //console.log("List of channels:::")
        //console.log(io.sockets.adapter.rooms)
        //console.log(socket.rooms);
      });

      socket.on("unsubscribe", (room) => {
        console.log("unsubscribe room");
        //console.log(room);

        socket.leave(room);
      });

  


    });

    
  });
});
