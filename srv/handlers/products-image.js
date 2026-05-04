const { Readable } = require('node:stream');
const { buffer: streamToBuffer } = require('node:stream/consumers');
const { uploadImage, downloadImage, deleteImage } = require('../lib/dropbox');

/**
 * Registra los handlers de imagen (Dropbox) sobre la entidad Products.
 * @param {import('@sap/cds').Service} srv - instancia del ApplicationService
 */

module.exports = (srv) => {

    const { Products } = srv.entities;

    // ──────────────────────────────────────────────────────────────
    // CREATE / UPDATE → subir / actualizar en Dropbox
    // ──────────────────────────────────────────────────────────────
    srv.before(['CREATE', 'UPDATE'], Products, async (req) => {
        const incoming = req.data.image;
        if (incoming === undefined) return;

        const ID = req.data.ID || req.params?.[0]?.ID;

        // Usuario quitó la imagen
        if (incoming === null) {
            const prev = await SELECT.one.from(Products).columns('fileName').where({ ID });
            if (prev?.fileName) await deleteImage(prev.fileName);
            req.data.fileName = null;
            req.data.image = null;
            return;
        }

        // Imagen nueva → subir
        const buf = Buffer.isBuffer(incoming) ? incoming : await streamToBuffer(incoming);
        const ext = (req.data.imageType || 'image/png').split('/')[1] || 'png';
        const path = await uploadImage(ID, buf, ext);

        req.data.fileName = path;
        req.data.imageType = req.data.imageType || 'image/png';
        req.data.image = null;
    });

    // ──────────────────────────────────────────────────────────────
    // READ stream (GET .../Products(...)/image)
    //    - Activo: bajar de Dropbox
    //    - Draft : default (LargeBinary local del draft)
    // ──────────────────────────────────────────────────────────────
    srv.on('READ', Products, async (req, next) => {
        // ¿Es petición de stream del campo image?  → la URL termina en /image
        const url = req._?.req?.path || req._?.req?.url || '';
        const isStreamReq = /\/image(\?|$)/.test(url);
        if (!isStreamReq) return next();

        // Solo interceptamos el activo. En draft, dejamos el comportamiento default
        // (el binary vive en la tabla _drafts).
        const key = req.params?.[0] || {};
        const isActive = key.IsActiveEntity === true || key.IsActiveEntity === 'true';
        if (!isActive) return next();

        const meta = await SELECT.one.from(Products)
            .columns('fileName', 'imageType')
            .where({ ID: key.ID });

        if (!meta?.fileName) return null;          // sin imagen → 204

        const buf = await downloadImage(meta.fileName);
        return Readable.from(buf);                  // ← Readable directo, NO array
    });


    // ──────────────────────────────────────────────────────────────
    // DELETE → borrar archivo en Dropbox luego de borrar un producto
    // ──────────────────────────────────────────────────────────────
    srv.before('DELETE', Products, async (req) => {
        const ID = req.params?.[0]?.ID;
        if (!ID) return;
        const prev = await SELECT.one.from(Products).columns('fileName').where({ ID });
        if (prev?.fileName) await deleteImage(prev.fileName);
    });
};