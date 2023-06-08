const db = require("../../db/db_config");

async function infoUser(client, message) {
  let number = message.from.split("@")[0];
  let newNumber = number;
  let platform = message.deviceType.replace("a", "A");
  if (number.startsWith("62")) {
    newNumber = "0" + number.slice(2);
  }
  const sql = `SELECT * FROM users AS user JOIN tools_count ON user.number = tools_count.number WHERE user.number = ${newNumber}`;

  db.query(sql, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      const info = result[0];

      let waktuString = info.updatedAt;
      let waktu = new Date(waktuString);

      let tahun = waktu.getFullYear();
      let bulan = waktu.toLocaleString("default", { month: "long" });
      let tanggal = waktu.getDate();
      let jam = waktu.getHours();
      let menit = waktu.getMinutes();
      let detik = waktu.getSeconds();

      let waktuTerformat =
        bulan +
        " " +
        tanggal +
        ", " +
        tahun +
        " | " +
        jam +
        ":" +
        menit +
        ":" +
        detik;

      console.log(waktuTerformat);

      const media = `*Informasi*\nNama: ${info.name}\nNomer: ${newNumber}\nPlatform: ${platform}\n\n*Ringkasan Penggunaan Bot*\nYouTube Downloader: ${info.youtube}\nInstagram & IG Stories Downloader: ${info.instagram}\nTiktok Downloader: ${info.tiktok}\nImage to Sticker: ${info.sticker}\n\nTotal Foto: ${info.total_images}\nTotal Video: ${info.total_videos}\nTotal Music: ${info.total_music}\n\nTerakhir Menggunakan Tools\n${waktuTerformat} WIB`;
      client.sendMessage(message.from, media);
    }
  });
}

module.exports = infoUser;
