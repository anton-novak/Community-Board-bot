const db = require('./db');

async function postAd(ad) {
    const response = await db.insert(ad);
    return response;
}

async function getAllAds() {
    const list = await db.list();
    const ads = list.rows.map(async (ad) => {
        return await getAd(ad.id);
    });
    return Promise.all(ads);
}

async function getAd(id) {
    const ad = await db.get(id);
    return ad;
}

module.exports = { postAd, getAllAds };