const db = require("../../db/db_config");
const sendingMessage = require("../sending-message");

function admin(client, message, number, pushname) {
  const newMessage = message.body.split(" ")[1];
  const unblockNumber = message.body.split(" ")[2];
  const broadcast = message.body.split(": ")[1];
  const sql =
    "SELECT adm.id, adm.number, users.name FROM admin AS adm INNER JOIN users ON adm.number = users.number";
  let users = "*Pengguna Bot Ryuu*\n";
  let total_user, total_instagram, total_youtube, total_tiktok, total_sticker;
  let total_images, total_videos, total_music;
  db.query(sql, (err, res) => {
    if (err) {
      console.error(err);
      return;
    }

    if (res.length === 0) {
      return;
    }

    const admin = res.find((admin) => admin.number === number);

    if (!admin) {
      const content =
        "Sayangnya kamu bukan admin, jadi tidak bisa mengakses menu admin";
      client.sendMessage(message.from, content);
      sendingMessage(pushname, content);
      return;
    }

    if (newMessage === "getUsers") {
      db.query("SELECT COUNT(*) AS total_user FROM users", (err, res) => {
        if (err) {
          console.log(err);
          return;
        }
        const total_users = res[0];
        total_user = total_users.total_user;
      });

      db.query("SELECT number, name FROM users", (err, res) => {
        if (err) {
          console.error(err);
          return;
        }

        for (let i = 0; i < res.length; i++) {
          const user = res[i];
          users += `${i + 1}. ${user.name}\n`;
        }

        users += `\nTotal Users: ${total_user}`;
        client.sendMessage(message.from, users);
        sendingMessage("Admin", users);
      });
    } else if (newMessage === "getDetail") {
      db.query(
        "SELECT SUM(instagram) AS total_instagram, SUM(youtube) AS total_youtube, SUM(tiktok) AS total_tiktok, SUM(sticker) AS total_sticker, SUM(total_images) AS total_images, SUM(total_videos) AS total_videos, SUM(total_music) AS total_music FROM tools_count",
        (err, res) => {
          if (err) {
            console.log(err);
            return;
          }
          const total_count = res[0];
          total_youtube = total_count.total_youtube;
          total_instagram = total_count.total_instagram;
          total_tiktok = total_count.total_tiktok;
          total_sticker = total_count.total_sticker;
          total_images = total_count.total_images;
          total_videos = total_count.total_videos;
          total_music = total_count.total_music;
        }
      );
      setTimeout(() => {
        const content = `*Detail Penggunaan Bot*\nPenggunaan YouTube: ${total_youtube}\nPenggunaan Instagram: ${total_instagram}\nPenggunaan Tiktok: ${total_tiktok}\nPenggunaan Sticker: ${total_sticker}\n\nImage Terunduh: ${total_images}\nVideo Terunduh: ${total_videos}\nMusic Terunduh: ${total_music}`;

        client.sendMessage(message.from, content);
        sendingMessage("Admin", content);
      }, 5000);
    } else if (newMessage === "unblock") {
      const formattedNumber = `62${unblockNumber.substring(1)}@c.us`;
      db.query(
        "UPDATE users SET countion = 0 WHERE number = ?",
        [unblockNumber],
        (err, res) => {
          console.log(err);
          if (!err) {
            client.sendMessage(
              formattedNumber,
              "Halo, kamu sudah bisa kembali menggunakan bot\nJika melanggar kembali aturan, maka nomer kamu akan di banned kembali\n\nTTD\n*Admin Tamvan*"
            );
            message.reply("Sukses");
          }
        }
      );
      db.query(
        "UPDATE users SET isBlocked = 0 WHERE number = ?",
        [unblockNumber],
        (err, res) => {
          console.log(err);
        }
      );
    } else if (newMessage === "broadcast") {
      db.query("SELECT number FROM users", (err, res) => {
        res.forEach((num) => {
          let formattedNumber = `62${num.number.substring(1)}@c.us`;
          client.sendMessage(formattedNumber, broadcast);
        });
        sendingMessage("Admin", broadcast);
      });
    }
  });
}

module.exports = admin;
