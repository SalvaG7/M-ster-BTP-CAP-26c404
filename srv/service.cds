using {com.logaligroup as entities} from '../db/schema';
using {API_BUSINESS_PARTNER as bp} from './external/API_BUSINESS_PARTNER';
using {API_BUSINESS_PARTNER_OP as op} from './external/API_BUSINESS_PARTNER_OP';

service Products {

    type dialog {
        myOption : String(10);
        myAmount: Integer;
    };

    entity Products         as projection on entities.Products;
    entity ProductDetails   as projection on entities.ProductDetails;
    entity Suppliers        as projection on entities.Suppliers;
    entity Contacts         as projection on entities.Contacts;
    entity Reviews          as projection on entities.Reviews;
    entity Inventories      as projection on entities.Inventories actions {
        @Core.OperationAvailable: {
            $edmJson: {
                $If:[
                    {
                        $Eq:[
                            {
                                $Path: 'in/product/IsActiveEntity'
                            },
                            false
                        ]
                    },
                    false,
                    true
                ]
            }
        }
        @Common: {
            SideEffects: {
                $Type: 'Common.SideEffectsType',
                TargetProperties: [
                    'in/quantity'
                ],
                TargetEntities:[
                    in.product
                ]
            }
        }
        action setStock (
            in: $self,
            option: dialog:myOption,
            amount: dialog:myAmount
        )
    };
    entity Sales            as projection on entities.Sales;

    /** Entities - Value Help */
    @readonly
    entity Status           as projection on entities.Status;

    @readonly
    entity VH_Categories    as projection on entities.Categories;

    @readonly
    entity VH_SubCategories as projection on entities.SubCategories;

    @readonly
    entity VH_Departments    as projection on entities.Departments;

    @readonly
    entity VH_Options as projection on entities.Options;

    /** External Entities */

    entity BusinessPartner as projection on bp.A_BusinessPartner {
        key BusinessPartner,
            FirstName,
            LastName
    };

    entity SuppliersV2 as projection on bp.A_Supplier {
        key Supplier,
            SupplierName,
            SupplierFullName
    };


    entity BusinessPartnerV2 as projection on op.A_BusinessPartner {
        key BusinessPartner,
            FirstName,
            LastName
    };
};
