require('dotenv').config();
const cds = require('@sap/cds');
const registerImageHandlers = require('./handlers/products-image');

module.exports = class Products extends cds.ApplicationService {

    init() {
        const { Products, Inventories } = this.entities;

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

        // Integración con Dropbox
        registerImageHandlers(this);

        return super.init();
    }
};