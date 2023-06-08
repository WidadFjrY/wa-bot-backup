const { Client, Message } = require("whatsapp-web.js");

const client = new Client();

client.on("message", async (message) => {
  const senderContact = message.sender.contact;
  console.log(senderContact.name); // Accessing the name of the sender Contact
});
