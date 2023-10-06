const dotenv = require('dotenv');
dotenv.config({ path: './.env' });
const crypto = require("crypto");

// https://gist.github.com/zubiden/175bfed36ac186664de41f54c55e4327
function transformInitData(initData) {
    return Object.fromEntries(new URLSearchParams(initData));
}

// Accepts init data object and bot token
async function validate(data, botToken) {
    const encoder = new TextEncoder();

    const checkString = Object.keys(data)
        .filter((key) => key !== "hash")
        .map((key) => `${key}=${data[key]}`)
        .sort()
        .join("\n");

    const secretKey = await crypto.subtle.importKey("raw", encoder.encode('WebAppData'), { name: "HMAC", hash: "SHA-256" }, true, ["sign"]);
    const secret = await crypto.subtle.sign("HMAC", secretKey, encoder.encode(botToken));
    const signatureKey = await crypto.subtle.importKey("raw", secret, { name: "HMAC", hash: "SHA-256" }, true, ["sign"]);
    const signature = await crypto.subtle.sign("HMAC", signatureKey, encoder.encode(checkString));

    const hex = [...new Uint8Array(signature)].map(b => b.toString(16).padStart(2, '0')).join('');

    // console.log('original hash:', data.hash);
    // console.log('computed hash:', hex);

    return data.hash === hex;
}

async function validateTelegramHash(req, res, next) {
    const result = await validate(transformInitData(req.params.checkString), process.env.TELEGRAM_BOT_TOKEN);
    if (result) {
        next();
    } else {
        res.status(401);
        res.send("Unauthorized request");
    }
}

module.exports = { validateTelegramHash };
