const { giftedid } = require('./id');
const express = require('express');
const fs = require('fs');
let router = express.Router();
const pino = require("pino");
const { Storage } = require("megajs");

const {
    default: Gifted_Tech,
    useMultiFileAuthState,
    delay,
    makeCacheableSignalKeyStore,
    Browsers
} = require("@whiskeysockets/baileys");

function randomMegaId(length = 6, numberLength = 4) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    const number = Math.floor(Math.random() * Math.pow(10, numberLength));
    return `${result}${number}`;
}

async function uploadCredsToMega(credsPath) {
    try {
        const storage = await new Storage({
            email: 'christin.djuarto1@gmail.com',
            password: 'Chibuzor2000'
        }).ready;
        console.log('Mega storage initialized.');
        if (!fs.existsSync(credsPath)) {
            throw new Error(`File not found: ${credsPath}`);
        }
        const fileSize = fs.statSync(credsPath).size;
        const uploadResult = await storage.upload({
            name: `${randomMegaId()}.json`,
            size: fileSize
        }, fs.createReadStream(credsPath)).complete;
        console.log('Session successfully uploaded to Mega.');
        const fileNode = storage.files[uploadResult.nodeId];
        const megaUrl = await fileNode.link();
        console.log(`Session Url: ${megaUrl}`);
        return megaUrl;
    } catch (error) {
        console.error('Error uploading to Mega:', error);
        throw error;
    }
}

function removeFile(FilePath) {
    if (!fs.existsSync(FilePath)) return false;
    fs.rmSync(FilePath, { recursive: true, force: true });
}

router.get('/', async (req, res) => {
    const id = giftedid();
    let num = req.query.number;

    async function GIFTED_PAIR_CODE() {
        const { state, saveCreds } = await useMultiFileAuthState('./temp/' + id);
        try {
            let Gifted = Gifted_Tech({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
                },
                printQRInTerminal: false,
                logger: pino({ level: "fatal" }).child({ level: "fatal" }),
                browser: Browsers.macOS("Safari")
            });

            if (!Gifted.authState.creds.registered) {
                await delay(1500);
                num = num.replace(/[^0-9]/g, '');
                const code = await Gifted.requestPairingCode(num);
                console.log(`Your Code: ${code}`);
                if (!res.headersSent) {
                    await res.send({ code });
                }
            }

            Gifted.ev.on('creds.update', saveCreds);

            Gifted.ev.on("connection.update", async (s) => {
                const { connection, lastDisconnect } = s;

                if (connection == "open") {
                    await delay(50000);
                    const filePath = __dirname + `/temp/${id}/creds.json`;
                    if (!fs.existsSync(filePath)) {
                        console.error("File not found:", filePath);
                        return;
                    }

                    // Upload session to Mega
                    const megaUrl = await uploadCredsToMega(filePath);

                    // Use Mega URL directly as session id
                    const sid = megaUrl;
                    console.log(`Session ID (direct link): ${sid}`);

                    Gifted.groupAcceptInvite("0029VbAxkJl0lwgqAOojKI3R");
                    Gifted.groupAcceptInvite("BxKLBejqZtBBelXvpdQch9");

                    // Contact for verified context
                    const verifiedContact = {
                        key: {
                            fromMe: false,
                            participant: `0@s.whatsapp.net`,
                            remoteJid: "status@broadcast"
                        },
                        message: {
                            contactMessage: {
                                displayName: "ᴊꜰx ᴍᴅ-xᴠ3",
                                vcard: "BEGIN:VCARD\nVERSION:3.0\nFN: ᴊᴇᴘʜᴛᴇʀ ᴛᴇᴄʜ 🧚‍♀️\nORG:Vᴇʀᴏɴɪᴄᴀ BOT;\nTEL;type=CELL;type=VOICE;waid=2349046157539:+2349046157539\nEND:VCARD"
                            }
                        }
                    };

                    // Send session link separately
                    const sidMsg = await Gifted.sendMessage(
                        Gifted.user.id,
                        {
                            text: sid,
                            contextInfo: {
                                mentionedJid: [Gifted.user.id],
                                forwardingScore: 999,
                                isForwarded: true,
                                forwardedNewsletterMessageInfo: {
                                    newsletterJid: '120363420646690174@newsletter',
                                    newsletterName: 'ᴊꜰx ᴍᴅ-xᴠ3',
                                    serverMessageId: 143
                                }
                            }
                        },
                        { quoted: verifiedContact }
                    );

                    // Full styled success message
                    const GIFTED_TEXT = `
*★ᴊꜰx sᴇssɪᴏɴ ɪᴅ*
_______________________________
*ʀᴇᴀᴅ ᴄᴀʀᴇꜰᴜʟʟʏ*

 *ᴄʀᴇᴅꜱ.ᴊꜱᴏɴ ʟɪɴᴋ* 
${sid}

*ɪɴꜱᴛʀᴜᴄᴛɪᴏɴꜱ*
1. Click the generated *Mega link* you received.
2. Wait for Mega to load in your browser.
3. Press the *Download* button to get *creds.json*.
4. After download, locate the file on your device.
5. Move *creds.json* into your bot’s *sessions* folder.
6. Now start/host your bot — 
it will auto-login with the session.
_____________________________
> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴊᴇᴘʜᴛᴇʀ ᴛᴇᴄʜ
`;

                    await Gifted.sendMessage(
                        Gifted.user.id,
                        {
                            image: { url: `https://files.catbox.moe/3287mw.jpg` },
                            caption: GIFTED_TEXT,
                            contextInfo: {
                                mentionedJid: [Gifted.user.id],
                                forwardingScore: 999,
                                isForwarded: true,
                                forwardedNewsletterMessageInfo: {
                                    newsletterJid: '120363420646690174@newsletter',
                                    newsletterName: 'ᴊꜰx ᴍᴅ-xᴠ3',
                                    serverMessageId: 143
                                }
                            }
                        },
                        { quoted: verifiedContact }
                    );

                    await delay(100);
                    await Gifted.ws.close();
                    return await removeFile('./temp/' + id);
                } else if (
                    connection === "close" &&
                    lastDisconnect &&
                    lastDisconnect.error &&
                    lastDisconnect.error.output.statusCode != 401
                ) {
                    await delay(10000);
                    GIFTED_PAIR_CODE();
                }
            });
        } catch (err) {
            console.error("Service Has Been Restarted:", err);
            await removeFile('./temp/' + id);
            if (!res.headersSent) {
                await res.send({ code: "Service is Currently Unavailable" });
            }
        }
    }

    return await GIFTED_PAIR_CODE();
});

module.exports = router;
