import express from "express";
import multiparty from "connect-multiparty";
import { GroupMessageController } from "../controllers/index.js";
import { mdAuth } from "../middlewares/index.js";

const mdUpload = multiparty({ uploadDir: "./uploads/images" });
const mdUploadFile = multiparty({ uploadDir: "./uploads/files" });

const api = express.Router();

api.post("/group/message", [mdAuth.asureAuth], GroupMessageController.sendText);
api.put("/group/message/edit", [mdAuth.asureAuth], GroupMessageController.sendTextEditado);
api.delete("/group/message/delete", [mdAuth.asureAuth], GroupMessageController.deleteMessage);
api.post("/group/message/image",  [mdAuth.asureAuth, mdUpload],  GroupMessageController.sendImage);
api.post("/group/message/file",  [mdAuth.asureAuth, mdUploadFile],  GroupMessageController.sendFile);
api.get( "/group/message/:group_id",  [mdAuth.asureAuth],  GroupMessageController.getAll);
api.get( "/group/message/total/:group_id", [mdAuth.asureAuth],  GroupMessageController.getTotalMessages);
api.get("/group/message/last/:group_id", [mdAuth.asureAuth],  GroupMessageController.getLastMessage);

export const groupMessageRoutes = api;
