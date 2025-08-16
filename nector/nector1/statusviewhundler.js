import config from '../../config.cjs';

const Statusupdate = async (json, sock) => {
  if (!config.AUTO_STATUS_SEEN) return;

  for (const msg of json) {
    if (msg.key && msg.key.remoteJid && msg.key.remoteJid.endsWith('@status')) {
      try {
        await sock.readMessages([msg.key]);
        console.log(`✅ Auto-viewed status from ${msg.key.remoteJid}`);
      } catch (err) {
        console.error(`❌ Error auto-viewing status from ${msg.key.remoteJid}:`, err);
      }
    }
  }
};

export default Statusupdate;
        
