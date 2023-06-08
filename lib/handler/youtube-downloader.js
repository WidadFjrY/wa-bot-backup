const { MessageMedia } = require("whatsapp-web.js");
const ytdl = require("ytdl-core");
const fs = require("fs");
const path = require("path");
const sendingMessage = require("../sending-message");
const db = require("../../db/db_config");

async function youtubeDownloaderMp4(url, client, message, pushname) {
  const options = {
    filter: "audioandvideo",
  };
  const getVideoId = ytdl.getURLVideoID(url);

  let number = message.from.split("@")[0];
  let newNumber = number;
  if (number.startsWith("62")) {
    newNumber = "0" + number.slice(2);
  }
  let urlThumbnails, thumbnails;
  let title, duration, author, totalViews;
  let mediaPath;
  let stats;
  let fileSizeInBytes, fileSizeInMegabytes, fileSize;

  if (ytdl.validateURL(url)) {
    ytdl
      .getInfo(url)
      .then((info) => {
        title = info.videoDetails.title.replace(/[\/|]+/g, "-");
        duration = info.videoDetails.lengthSeconds;
        author = info.videoDetails.author.name;
        totalViews = info.videoDetails.viewCount;
        mediaPath = path.join(__dirname, `../../media/videos/${title}.mp4`);
      })
      .then(() => {
        const content = `Video *${title}* akan dikirim, mungkin membutuhkan beberapa menit.\nMohon ditunggu....`;
        client.sendMessage(message.from, content);
        sendingMessage(pushname, content);
        urlThumbnails = `https://i.ytimg.com/vi/${getVideoId}/hqdefault.jpg`;
      })
      .then(() => {
        ytdl(url, options)
          .pipe(fs.createWriteStream(mediaPath))
          .on("finish", async () => {
            const media = MessageMedia.fromFilePath(mediaPath);
            stats = fs.statSync(mediaPath);
            fileSizeInBytes = stats.size;
            fileSizeInMegabytes = fileSizeInBytes / (1024 * 1024);
            fileSize = fileSizeInMegabytes.toFixed(2);

            const caption =
              "Judul: " +
              title +
              "\nAuthor: " +
              author +
              "\nDurasi: " +
              duration +
              " Detik" +
              "\nDilihat: " +
              totalViews +
              " Kali";

            thumbnails = await MessageMedia.fromUrl(urlThumbnails);

            if (fileSize >= 10) {
              await client.sendMessage(message.from, thumbnails);
              await client.sendMessage(message.from, media, {
                sendMediaAsDocument: true,
                caption: false,
              });
              await client.sendMessage(message.from, caption);
            } else {
              await client.sendMessage(message.from, media, {
                sendMediaAsDocument: false,
                caption: caption,
              });
            }
            sendingMessage(pushname, url);
            db.query(
              "UPDATE tools_count SET total_videos = total_videos + 1, youtube = youtube + 1 WHERE number = ?",
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
      })
      .catch((error) => {
        console.log(error);
      });
  } else {
    message.reply("Link YouTube tidak valid");
  }
}

function youtubeDownloaderMp3(url, client, message, messageFrom) {
  let number = message.from.split("@")[0];
  let newNumber = number;
  if (number.startsWith("62")) {
    newNumber = "0" + number.slice(2);
  }
  let title, author, duration;
  let urlThumbnails;
  let thumbnails;
  let mediaPath;
  let getVideoId = ytdl.getURLVideoID(url);
  const options = {
    filter: "audioonly",
  };

  if (ytdl.validateURL(url)) {
    ytdl
      .getInfo(url)
      .then((info) => {
        title = info.videoDetails.title.replace(/[\/|]+/g, "-");
        author = info.videoDetails.author.name;
        duration = info.videoDetails.lengthSeconds;
        urlThumbnails = `https://i.ytimg.com/vi/${getVideoId}/hqdefault.jpg`;
      })
      .then(async () => {
        client.sendMessage(
          message.from,
          `Musik *${title}* akan dikirim, mungkin membutuhkan beberapa menit.\nMohon ditunggu....`
        );
        mediaPath = path.join(__dirname, `../../media/music/${title}.mp3`);

        thumbnails = await MessageMedia.fromUrl(urlThumbnails);
      })
      .then(() => {
        ytdl(url, options)
          .pipe(fs.createWriteStream(mediaPath))
          .on("finish", async () => {
            await client
              .sendMessage(message.from, thumbnails)
              .then(async () => {
                const media = MessageMedia.fromFilePath(mediaPath);
                await client
                  .sendMessage(message.from, media, {
                    sendMediaAsDocument: true,
                    caption: false,
                  })
                  .then(() => {
                    const caption =
                      "Judul:\t" +
                      title +
                      "\nAuthor:\t" +
                      author +
                      "\nDurasi:" +
                      duration +
                      " Detik";

                    client.sendMessage(message.from, caption);
                    sendingMessage(messageFrom, url);

                    db.query(
                      "UPDATE tools_count SET total_music = total_music + 1, youtube = youtube + 1 WHERE number = ?",
                      newNumber,
                      (error, result) => {
                        if (error) {
                          console.error(
                            "Gagal melakukan UPDATE: " + error.message
                          );
                          return;
                        }
                        console.log("Data berhasil diupdate.");
                      }
                    );
                  });
              });
          });
      })
      .catch((error) => {
        console.log(error);
      });
  } else {
    message.reply("Link YouTube tidak valid");
  }
}

module.exports = { youtubeDownloaderMp4, youtubeDownloaderMp3 };
