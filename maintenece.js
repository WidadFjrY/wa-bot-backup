const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const path = require("path");
const {
  youtubeDownloaderMp3,
  youtubeDownloaderMp4,
} = require("./lib/handler/youtube-downloader");
const greeting = require("./lib/handler/greeting");
const notes = require("./lib/notes");
const {
  feedReelDown,
  storiesDown,
} = require("./lib/handler/instagram-downloader");
const sendingMessage = require("./lib/sending-message");
const tiktokDownloader = require("./lib/handler/tiktok-downloader");
const infoUser = require("./lib/handler/infoUser");
const db = require("./db/db_config");

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome",
  },
});

client.on("qr", (qr) => {
  console.log("PINDAI KODE INI UNTUK LOGIN KE WHATSAPP");
  qrcode.generate(qr, { small: true });
});

client.on("loading_screen", (msg) => {
  console.log("Loading Chat -", msg);
});

client.on("ready", () => {
  console.log("Client Ready");
});

client.on("auth_failure", (msg) => {
  console.log("autentikasi gagal", msg);
});

client.initialize();

client.on("message", async (message) => {
  message.reply("Maaf Bot sedang dalam perbaikan");
});
