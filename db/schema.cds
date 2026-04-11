namespace com.logaligroup;

using {
    cuid,
    managed,
    sap.common.CodeList
} from '@sap/cds/common';

entity Products : cuid, managed {
    product      : String(10);
    productName  : String(40);
    description  : LargeString;
    category     : Association to Categories; //category_ID       --> ValueHelp
    subCategory  : Association to SubCategories; //subCategory_ID    --> ValueHelp
    statu        : Association to Status; //statu_code        --> InStock, OutOfStock o LowAvailability
    price        : Decimal(6, 2); //0001.23
    rating       : Decimal(3, 2); //1.05
    currency     : String;
    detail       : Association to ProductDetails; //(detail_ID) --> 9ea4f4c3-6fac-4a79-a278-7f4516ab5a37
    supplier     : Association to Suppliers;
    toReviews    : Association to many Reviews
                       on toReviews.product = $self;
    toInventories : Association to many Inventories
                       on toInventories.product = $self;
    toSales      : Association to many Sales
                       on toSales.product = $self;
};

type myDecimal : Decimal(8, 3);

entity ProductDetails : cuid {
    baseUnit   : String default 'EA';
    width      : myDecimal;
    height     : myDecimal;
    depth      : myDecimal;
    weight     : myDecimal;
    unitVolume : String default 'CM';
    unitWeight : String default 'KG';
};

entity Categories : cuid {
    category        : String(40);
    description     : LargeString;
    toSubCategories : Association to many SubCategories
                          on toSubCategories.category = $self;
};

entity SubCategories : cuid {
    subCategory : String(40);
    description : LargeString;
    category    : Association to Categories; //(category_ID)
};


entity Suppliers : cuid {
    supplier     : String(10);
    supplierName : String(40);
    webAddress   : String(250);
    contact      : Association to Contacts;
};


entity Contacts : cuid {
    fullName    : String(40);
    email       : String(80);
    phoneNumber : String(14);
};

entity Reviews : cuid {
    rating     : Decimal(3, 2);
    date       : Date;
    user       : String(20);
    reviewText : LargeString;
    product    : Association to Products;
};

entity Inventories : cuid {
    stockNumber : String(10);
    department  : Association to Departments;
    min         : Integer;
    max         : Integer;
    target      : Integer;
    quantity    : Decimal(6, 3);
    baseUnit    : String default 'EA';
    product     : Association to Products;
};

entity Sales : cuid {
    month         : String(20);
    monthCode     : String(2);
    year          : String(4);
    quantitySales : Integer;
    product       : Association to Products;
};

entity Departments : cuid {
    department  : String(40);
    description : String;
};

entity Status : CodeList {
    key code : String(20) enum {
            InStock = 'In Stock';
            OutOfStock = 'Out of Stock';
            LowAvailability = 'Low Availability';
        };
};
