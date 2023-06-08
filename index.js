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
const admin = require("./lib/handler/admin");
const countion = require("./lib/handler/countion");
const fs = require("fs");

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
  const sql = "SELECT number FROM users";
  let sender = (await message.getContact()).pushname;
  let number = message.from.split("@")[0];
  let newNumber = number;
  if (number.startsWith("62")) {
    newNumber = "0" + number.slice(2);
  }
  db.query(sql, (err, result) => {
    let isExist = true;
    for (let i = 0; i < result.length; i++) {
      const number = result[i];
      if (number.number === newNumber) {
        isExist = false;
      }
    }

    if (isExist) {
      const newDataUser = {
        number: newNumber,
        name: sender,
      };

      const newDataCount = {
        number: newNumber,
      };

      db.query("INSERT INTO users SET ?", newDataUser, (error, results) => {
        if (error) {
          console.error("Gagal melakukan INSERT: " + error.message);
          return;
        }
      });

      db.query(
        "INSERT INTO tools_count SET ?",
        newDataCount,
        (error, results) => {
          if (error) {
            console.error("Gagal melakukan INSERT: " + error.message);
            return;
          }
        }
      );
      isExist = true;
    }
  });

  console.log("\nPengirim\t:", sender);
  console.log("Pesan\t\t:", message.body);
  console.log("Media\t\t:", message.hasMedia);

  messageIf(message, client, sender, newNumber);
  checkSpam(client, message, message.from, sender, newNumber);
});

async function messageIf(message, client, sender, newNumber) {
  let isBanned = false;
  try {
    isBanned = await countion(client, message, newNumber, sender);
  } catch (err) {
    console.error(err);
    return;
  }

  if (!isBanned) {
    console.log("user diban");
    return;
  }

  if (
    message.body.toLowerCase() === "halo" ||
    message.body.toLowerCase() === "p" ||
    message.body.toLowerCase() === "hai" ||
    message.body.toLowerCase() === "hei"
  ) {
    greeting(client, message.from, sender);
  } else if (message.body.startsWith("/admin ")) {
    admin(client, message, newNumber, sender);
  } else if (message.body === "/admin") {
    fs.readFile("./text/admin.txt", "utf8", (err, data) => {
      if (err) {
        console.error(err);
        return;
      }
      client.sendMessage(message.from, data);
      sendingMessage(sender, data);
    });
  } else if (message.body === "/notes") {
    notes(client, message.from, sender);
  } else if (message.body.startsWith("/ytmp4 ")) {
    youtubeDownloaderMp4(message.body.split(" ")[1], client, message, sender);
  } else if (message.body === "/ytmp4") {
    const content =
      "Untuk mendownload YouTube gunakan format\n/ytmp4 linkyoutube\n Contoh : /ytmp4 https://youtu.be/FXfqLUuVBis";
    client.sendMessage(message.from, content);
    sendingMessage(sender, content);
  } else if (message.body.startsWith("/ytmp3 ")) {
    youtubeDownloaderMp3(message.body.split(" ")[1], client, message, sender);
  } else if (message.body === "/ytmp3") {
    const content =
      "Untuk mengkonversi YouTube ke mp3 gunakan format\n/ytmp3 linkyoutube\n Contoh : /ytmp3 https://youtu.be/FXfqLUuVBis";
    client.sendMessage(message.from, content);
    sendingMessage(sender, content);
  } else if (message.body.startsWith("/igdown ")) {
    feedReelDown(message.body.split(" ")[1], client, message, sender);
  } else if (message.body === "/igdown") {
    const content =
      "Untuk mendownload Feed/Reels gunakan format\n/igdown linkfeed\n Contoh : /igdown https://www.instagram.com/p/CrwRhHLv7WV/";
    client.sendMessage(message.from, content);
    sendingMessage(sender, content);
  } else if (message.body.startsWith("/igstories ")) {
    storiesDown(message.body.split(" ")[1], client, message, sender);
  } else if (message.body === "/igstories") {
    const content =
      "Untuk mendownload IG Stories gunakan format\n/igstories username\n Contoh : /igstories oliviarodrigo";
    client.sendMessage(message.from, content);
    sendingMessage(sender, content);
  }
  // else if (message.body.startsWith("/ttdown ")) {
  //   tiktokDownloader(message.body.split(" ")[1], client, message, sender);
  // }
  else if (message.body.toLowerCase() === "/ttdown") {
    const content = "Sayang nya tiktok downloader sedang di perbaiki";
    client.sendMessage(message.from, content);
    sendingMessage(sender, content);
  } else if (message.body.startsWith("/spotify ")) {
    SpotifyDownloader(message.body.split(" ")[1], client, message, sender);
  } else if (message.body === "/imgtostkr") {
    if (message.type === "image") {
      const img = await message.downloadMedia();
      client
        .sendMessage(message.from, img, {
          sendMediaAsSticker: true,
          stickerAuthor: "WidBot",
          stickerName: sender,
        })
        .then(() => {
          client.sendMessage(message.from, "Stiker terkirim");
          sendingMessage(sender, "Stiker terkirim");
          db.query(
            "UPDATE tools_count SET sticker = sticker + 1 WHERE number = ?",
            newNumber,
            (error, result) => {
              if (error) {
                console.error("Gagal melakukan UPDATE: " + error.message);
                return;
              }
              console.log("Data berhasil diupdate.");
            }
          );
        });
    } else {
      const content =
        "/imgtostkr harus dibarengi dengan gambar/foto.\nContoh :";
      client.sendMessage(message.from, content).then(() => {
        const media = MessageMedia.fromFilePath(
          path.join(__dirname, "./media/images/exa.jpg")
        );
        client.sendMessage(message.from, media, {
          caption: "/imgtostkr",
        });
        sendingMessage(sender, content);
      });
    }
  } else if (message.body === "/about") {
    const content = [
      "*CHAT BOT WA*\nVersion : V1.1.0 (Stable)\nMaintainer : WidadFjrY @_widadfjry\nTester :\n  - Nda @nda.xyz_\n  - Anang AW @aari.wb",
      "Hubungi saya jika ada masukan atau masalah(bug)\nwa.me/6282127264639",
    ];
    client.sendMessage(message.from, content[0]).then(() => {
      client.sendMessage(message.from, content[1]);
    });
    sendingMessage(sender, content);
  } else if (message.body === "/infouser") {
    infoUser(client, message, sender);
  } else {
    client.sendMessage(
      message.from,
      "Perintah tidak dikenali, ketik /notes untuk membuka catatan"
    );
    sendingMessage(
      sender,
      "Perintah tidak dikenali, ketik /notes untuk membuka catatan"
    );
  }
}

const spamCount = {};

function checkSpam(client, message, number, pushname, newNumber) {
  const currentTime = new Date().getTime();
  const timeWindow = 5000;

  if (!spamCount[number]) {
    spamCount[number] = {
      count: 1,
      lastMessageTime: currentTime,
    };
  } else {
    const lastMessageTime = spamCount[number].lastMessageTime;
    const elapsedTime = currentTime - lastMessageTime;

    if (elapsedTime <= timeWindow) {
      spamCount[number].count++;
      if (spamCount[number].count >= 5) {
        db.query(
          `UPDATE users SET countion = countion + 1 WHERE number = ?`,
          [newNumber],
          (err, res) => {
            console.log(err);
          }
        );
        db.query(
          "SELECT countion FROM users WHERE number = ?",
          [newNumber],
          (err, res) => {
            for (let i = 0; i < res.length; i++) {
              const countion = res[i].countion;
              client.sendMessage(
                message.from,
                `*⚠️PERINGATAN PROTEKSI SPAM⚠️*\nNama: ${pushname}\nPelanggaran: ${countion}/2`
              );
            }
          }
        );
        spamCount[number].count = 0;
      }
    } else {
      spamCount[number] = {
        count: 1,
        lastMessageTime: currentTime,
      };
    }
  }
}
