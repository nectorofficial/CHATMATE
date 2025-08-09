import dotenv from "dotenv";
dotenv.config();

import {
  makeWASocket,
  fetchLatestBaileysVersion,
  DisconnectReason,
  useMultiFileAuthState
} from "@whiskeysockets/baileys";

import { Handler, Callupdate, GroupUpdate } from "./nector/nector1/nector2.js";
import express from "express";
import pino from "pino";
import fs from "fs";
import path from "path";
import chalk from "chalk";
import axios from "axios";
import config from "./config.cjs";
import autoReactModule from "./lib/autoreact.cjs";
import { fileURLToPath } from "url";
import { File } from "megajs";

const { emojis, doReact } = autoReactModule;
const app = express();

let useQR = false;
let initialConnection = true;

const PORT = process.env.PORT || 3000;
const MAIN_LOGGER = pino({
  timestamp: () => `,"time":"${new Date().toJSON()}"`
});
const logger = MAIN_LOGGER.child({});
logger.level = "silent";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sessionDir = path.join(__dirname, "session");
const credsPath = path.join(sessionDir, "creds.json");

if (!fs.existsSync(sessionDir)) {
  fs.mkdirSync(sessionDir, { recursive: true });
}

async function downloadSessionData() {
  console.log("Debugging SESSION_ID:", config.SESSION_ID);

  if (!config.SESSION_ID) {
    console.error("❌ Please add your session to SESSION_ID env !!");
    return false;
  }

  const filePart = config.SESSION_ID.split("mega.nz/file/")[1];
  if (!filePart || !filePart.includes("#")) {
    console.error("❌ Invalid SESSION_ID format! It must contain both file ID and decryption key.");
    return false;
  }

  const [fileId, fileKey] = filePart.split("#");

  try {
    console.log("🔄 Downloading Session...");
    const megaFile = File.fromURL(`https://mega.nz/file/${fileId}#${fileKey}`);

    const fileBuffer = await new Promise((resolve, reject) => {
      megaFile.download((err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });

    await fs.promises.writeFile(credsPath, fileBuffer);
    console.log("🔒 Session Successfully Loaded !!");
    return true;
  } catch (err) {
    console.error("❌ Failed to download session data:", err);
    return false;
  }
}

async function start() {
  try {
    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
    const { version, isLatest } = await fetchLatestBaileysVersion();

    console.log(`🤖 THE-HUB-BOT using WA v${version.join(".")} | Latest: ${isLatest}`);

    const sock = makeWASocket({
      version,
      logger: pino({ level: "silent" }),
      printQRInTerminal: useQR,
      browser: ["THE-HUB-BOT", "Safari", "3.3"],
      auth: state,
      getMessage: async key => {
        if (store) {
          const msg = await store.loadMessage(key.remoteJid, key.id);
          return msg?.message;
        }
        return { conversation: "message" };
      }
    });

    sock.ev.on("connection.update", async ({ connection, lastDisconnect }) => {
      if (connection === "close") {
        if (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) {
          start();
        }
      } else if (connection === "open") {
        if (initialConnection) {
          console.log(chalk.green("✅ THE-HUB-BOT is now online!"));

          try {
            await sock.groupAcceptInvite("FHDEPkBBf281sUcdj17eU9");
            console.log(chalk.green("✅ Successfully joined group."));
          } catch (err) {
            console.error(chalk.red("❌ Failed to join group: " + err.message));
          }

          sock.newsletterFollow("120363395396503029@newsletter");
          sock.newsletterFollow("120363395396503029@newsletter");

          const imageData = { url: "https://files.catbox.moe/03qy6k.jpg" };
          await sock.sendMessage(sock.user.id, {
            image: imageData,
            caption: "ᴘᴏᴡᴇʀᴇᴅ ʙʏ THE-HUB-BOT",
            contextInfo: {
              isForwarded: true,
              forwardingScore: 999,
              forwardedNewsletterMessageInfo: {
                newsletterJid: "120363395396503029@newsletter",
                newsletterName: "NECTOR;;;",
                serverMessageId: -1
              },
              externalAdReply: {
                title: "NECTOR;;;",
                body: "THE-HUB-BOT whatsapp user bot",
                thumbnailUrl: "https://files.catbox.moe/03qy6k.jpg",
                sourceUrl: "https://whatsapp.com/channel/0029VadQrNI8KMqo79BiHr3l",
                mediaType: 1,
                renderLargerThumbnail: false
              }
            }
          });

          initialConnection = false;
        } else {
          console.log(chalk.blue("♻️ Connection reestablished after restart."));
        }
      }
    });

    sock.ev.on("creds.update", saveCreds);
    sock.ev.on("messages.upsert", msg => Handler(msg, sock, logger));
    sock.ev.on("call", call => Callupdate(call, sock));
    sock.ev.on("group-participants.update", update => GroupUpdate(sock, update));

    if (config.MODE === "public") {
      sock.public = true;
    } else if (config.MODE === "private") {
      sock.public = false;
    }

    sock.ev.on("messages.upsert", async m => {
      try {
        const message = m.messages[0];
        if (!message.key.fromMe && config.AUTO_REACT && message.message) {
          const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
          await doReact(randomEmoji, message, sock);
        }
      } catch (err) {
        console.error("Auto react error:", err);
      }
    });

  } catch (err) {
    console.error("Critical Error:", err);
    process.exit(1);
  }
}

async function init() {
  if (fs.existsSync(credsPath)) {
    console.log("🔒 Session file found, proceeding without QR.");
    await start();
  } else {
    const downloaded = await downloadSessionData();
    if (downloaded) {
      console.log("✅ Session downloaded, starting bot.");
      await start();
    } else {
      console.log("❌ No session found or invalid, printing QR.");
      useQR = true;
      await start();
    }
  }
}

init();

app.use(express.static(path.join(__dirname, "output")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "output", "index.html"));
});

app.listen(PORT, () => {
  console.log(`🌐 Server running on port ${PORT}`);
});
