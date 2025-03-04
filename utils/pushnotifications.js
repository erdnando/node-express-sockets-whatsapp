import { Expo } from "expo-server-sdk";

export function sendPushNotification(targetExpoPushToken, message) {

  console.log("sendPushNotification function....");
  const expo = new Expo();
  console.log("new Expo function....");
  const chunks = expo.chunkPushNotifications([
    { to: targetExpoPushToken, sound: "default", body: message }
  ]);

  console.log("chunks function....");
  console.log(chunks);


    // This code runs synchronously. We're waiting for each chunk to be send.
    // A better approach is to use Promise.all() and send multiple chunks in parallel.
    chunks.forEach(async chunk => {
      console.log("Sending Chunk", chunk);
      try {
        const tickets = await expo.sendPushNotificationsAsync(chunk);
        console.log("Tickets:::", tickets);
      } catch (error) {
        console.log("Error sending chunk", error);
      }
    });

   
  

 


}
