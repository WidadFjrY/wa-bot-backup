-- Active: 1678672883589@@127.0.0.1@3306@user_informations

UPDATE users SET countion = 0 WHERE number = "082127264639";

ALTER TABLE users
ADD
    COLUMN isBlocked BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE users RENAME COLUMN caution TO countion;

SELECT * FROM users;

ALTER TABLE users ADD COLUMN caution INT DEFAULT 0;

SELECT * FROM tools_count;

SELECT COUNT(*) AS total_user FROM users;

SELECT SUM(instagram) AS total_instagram FROM tools_count;

SELECT
    SUM(instagram) AS total_instagram,
    SUM(youtube) AS total_youtube,
    SUM(tiktok) AS total_tiktok,
    SUM(sticker) AS total_sticker,
    SUM(total_images),
    SUM(total_videos),
    SUM(total_music)
FROM tools_count;

CREATE TABLE
    users(
        number VARCHAR(100) NOT NULL,
        name VARCHAR(100) NOT NULL,
        PRIMARY KEY (number),
        UNIQUE KEY number_unique (number)
    ) ENGINE = InnoDB;

INSERT INTO users(number, name) VALUES ("082127264639", "Widad");

CREATE TABLE
    tools_count(
        id INT NOT NULL AUTO_INCREMENT,
        number VARCHAR(100) NOT NULL,
        youtube INT NOT NULL DEFAULT 0,
        instagram INT NOT NULL DEFAULT 0,
        tiktok INT NOT NULL DEFAULT 0,
        sticker INT NOT NULL DEFAULT 0,
        total_images INT NOT NULL DEFAULT 0,
        total_videos INT NOT NULL DEFAULT 0,
        total_music INT NOT NULL DEFAULT 0,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        Foreign Key (number) REFERENCES users(number)
    ) ENGINE = InnoDB;

CREATE TABLE
    admin(
        id INT NOT NULL AUTO_INCREMENT,
        number VARCHAR(100),
        PRIMARY KEY(id),
        Foreign Key (number) REFERENCES users(number)
    ) ENGINE = InnoDB;

INSERT INTO admin(number) VALUES ("082127264639");

SELECT
    adm.id,
    adm.number,
    users.name
FROM admin AS adm
    INNER JOIN users ON adm.number = users.number;

SELECT *
FROM users AS user
    JOIN tools_count ON user.number = tools_count.number
WHERE
    user.number = "082127264639";

DROP TABLE users;

DROP TABLE tools_count;

INSERT INTO
    tools_count(
        number,
        youtube,
        instagram,
        tiktok,
        sticker,
        total_images,
        total_videos,
        total_music
    )
VALUES (
        "082127264639",
        "4",
        "4",
        "4",
        "4",
        "4",
        "4",
        "4"
    );

SELECT * FROM tools_count;

ALTER TABLE
    tools_count MODIFY COLUMN updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

SELECT * FROM users;

DELETE FROM tools_count;

DELETE FROM users;

SHOW CREATE TABLE tools_count;