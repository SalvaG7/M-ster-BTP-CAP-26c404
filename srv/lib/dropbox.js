const { Dropbox } = require('dropbox');


let _dbx;
const FOLDER = process.env.DROPBOX_FOLDER || '/products';

function client() {
    if (_dbx) return _dbx;
    _dbx = new Dropbox({
        clientId: process.env.DROPBOX_APP_KEY,
        clientSecret: process.env.DROPBOX_APP_SECRET,
        refreshToken: process.env.DROPBOX_REFRESH_TOKEN,
    });
    return _dbx;
}

const buildPath = (ID, ext = 'png') => `${FOLDER}/${ID}.${ext}`;

async function uploadImage(ID, buffer, ext = 'png') {
    const path = buildPath(ID, ext);
    const { result } = await client().filesUpload({
        path,
        contents: buffer,
        mode: { '.tag': 'overwrite' },
        autorename: false,
        mute: true,
    });
    return result.path_display;
}

async function downloadImage(path) {
    const { result } = await client().filesDownload({ path });
    return result.fileBinary;
}

async function deleteImage(path) {
    if (!path) return;
    try {
        await client().filesDeleteV2({ path });
    } catch (e) {
        if (e?.error?.error_summary?.startsWith('path_lookup/not_found')) return;
        console.warn('[dropbox] delete failed:', e?.error_summary || e.message);
    }
}

module.exports = { uploadImage, downloadImage, deleteImage, buildPath };