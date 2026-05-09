require('dotenv').config();
const cds = require('@sap/cds');
const registerImageHandlers = require('./handlers/products-image');
const { UPDATE, SELECT } = require('@sap/cds/lib/ql/cds-ql');

module.exports = class Products extends cds.ApplicationService {

    async init () {
        const { Products, Inventories, BusinessPartner, SuppliersV2, BusinessPartnerV2 } = this.entities;
        const cloud = await cds.connect.to("API_BUSINESS_PARTNER");
        const op = await cds.connect.to("API_BUSINESS_PARTNER_OP");

        this.on('READ', BusinessPartner, async (req)=> {
            return await cloud.tx(req).send({
                query: req.query ,
                headers: {
                    apikey: process.env.APIKEY
                }
            });
        });

        this.on('READ', SuppliersV2, async (req)=> {
            return await cloud.tx(req).send({
                query: req.query ,
                headers: {
                    apikey: process.env.APIKEY
                }
            });
        });

        this.on('READ', BusinessPartnerV2, async (req)=> {
            return await op.tx(req).send({
                query: req.query ,
                headers: {
                    Authorization: process.env.AUTHORIZATION
                }
            });
        });

        // PATH UPDATE
        // Inicializar el objecto detail
        this.before('NEW', Products.drafts, async (req) => {
            req.data.detail ??= {
                baseUnit: 'EA',
                width: null,
                height: null,
                depth: null,
                weight: null,
                unitVolume: 'CM',
                unitWeight: 'KG'
            };
        });

        // Numeración automática del stockNumber
        this.before('NEW', Inventories.drafts, async (req) => {
            const [persisted, drafts] = await Promise.all([
                SELECT.one.from(Inventories).columns('max(stockNumber) as maxStock'),
                SELECT.one.from(Inventories.drafts).columns('max(stockNumber) as maxStock'),
            ]);

            const toNum = (v) => {
                const n = parseInt(v, 10);
                return Number.isFinite(n) ? n : 0;
            };

            const next = Math.max(toNum(persisted?.maxStock), toNum(drafts?.maxStock)) + 1;
            req.data.stockNumber = String(next).padStart(4, '0');
        });

        // Constantes
        const OPTIONS = { ADD: 'A', SUBTRACT: 'S' };
        const STATUS  = { IN: 'InStock', OUT: 'OutOfStock', LOW: 'LowAvailability' };

        const computeStatus = (qty) => {
            if (qty <= 0)  return STATUS.OUT;
            if (qty < 300) return STATUS.LOW;
            return STATUS.IN;
        };

        this.on('setStock', async (req) => {
            const { option, amount } = req.data;

            // 1) Validación de inputs
            if (!Number.isInteger(amount) || amount <= 0)
                return req.reject(400, 'Amount must be a positive integer');
            if (!Object.values(OPTIONS).includes(option))
                return req.reject(400, `Invalid option: ${option}`);

            // 2) Resolución del contexto (siempre el último param es $self)
            const sInventoryId = req.params.at(-1)?.ID;
            if (!sInventoryId) return req.reject(400, 'Inventory key missing');

            const inv = await SELECT.one.from(Inventories)
                .columns('quantity', 'product_ID')
                .where({ ID: sInventoryId });
            if (!inv) return req.reject(404, 'Inventory not found');

            // 3) Validación de negocio
            const delta = option === OPTIONS.ADD ? amount : -amount;
            const newQuantity = Number(inv.quantity) + delta;

            if (newQuantity < 0)
                return req.reject(400, 'There is no availability for the requested quantity');

            // 4) Update atómico de quantity (sin race condition)
            await UPDATE(Inventories)
                .set({ quantity: { '+=': delta } })
                .where({ ID: sInventoryId });

            // 5) Recalcular y persistir status SOLO si cambió
            const newStatus = computeStatus(newQuantity);
            const product = await SELECT.one.from(Products)
                .columns('statu_code')
                .where({ ID: inv.product_ID });

            if (product?.statu_code !== newStatus) {
                await UPDATE(Products)
                    .set({ statu_code: newStatus })
                    .where({ ID: inv.product_ID });
            }

            // 6) Mensaje informativo (sin return)
            const verb = option === OPTIONS.ADD ? 'added to' : 'removed from';
            req.info(`${amount} units ${verb} the inventory. Status: ${newStatus}`);
        });

        // Integración con Dropbox
        registerImageHandlers(this);

        return super.init();
    }
};