const fs = require("fs");
require("dotenv").config();

const config = {
  // ================== BOT BASIC SETTINGS ==================
  BOT_NAME: "THE-HUB",            // Bot name
  OWNER_NAME: "ⓃⒺCⓉOR🍯",        // Owner display name
  OWNER_NUMBER: "254725474072",   // Owner number (with country code, no +)

  // ================== SESSION SETTINGS ==================
  MEGA_SESSION_URL: "https://mega.nz/file/V45X2CYS#tEc8PCbZ3yVtHJOmXBLGkdauBkkgsmv_1mYKqukzlW8",
  // Your MEGA session file link (make sure it's valid)

  // ================== BOT BEHAVIOR ==================
  PREFIX: "*",              // Command prefix
  ALWAYS_ONLINE: true,      // Keep bot online
  AUTO_TYPING: true,        // Fake typing
  AUTO_RECORDING: false,    // Fake recording
  AUTO_READ: false,         // Auto read chats
  AUTO_BIO: false,          // Change bio automatically
  AUTO_STATUS_VIEW: true,   // Auto view statuses

  // ================== LINKS ==================
  CHANNEL_LINK: "https://whatsapp.com/channel/XXXXXXXX",
  GROUP_LINK: "https://chat.whatsapp.com/XXXXXXXX",

  // ================== EXTRA FEATURES ==================
  WELCOME_MSG: true,        // Send welcome messages
  GOODBYE_MSG: true,        // Send goodbye messages
  ANTI_LINK: false,         // Anti-link in groups
};

export default config;
  
