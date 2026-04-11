using {com.logaligroup as entities} from '../db/schema';

service Products {

    entity Products         as projection on entities.Products;
    entity ProductDetails   as projection on entities.ProductDetails;
    entity Suppliers        as projection on entities.Suppliers;
    entity Contacts         as projection on entities.Contacts;
    entity Reviews          as projection on entities.Reviews;
    entity Inventories      as projection on entities.Inventories;
    entity Sales            as projection on entities.Sales;

    /** Entities - Value Help */
    entity Status           as projection on entities.Status;

    @readonly
    entity VH_Categories    as projection on entities.Categories;

    @readonly
    entity VH_SubCategories as projection on entities.SubCategories;
};
