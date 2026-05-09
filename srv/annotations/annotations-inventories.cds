using {Products as myservice} from '../service';

annotate myservice.Inventories with {
    stockNumber @title : 'Stock Number';
    department @title : 'Department';
    min @title : 'Minimum ';
    max @title : 'Maximum';
    target @title : 'Target';
    quantity @title : 'Quantity';
};

annotate myservice.Inventories with {
    department @Common: {
        Text : department.department,
        TextArrangement : #TextOnly
    }
};


annotate myservice.Inventories with @(
    UI.HeaderInfo : {
        TypeName : 'Inventory',
        TypeNamePlural : 'Inventories',
        Title : {
            $Type : 'UI.DataField',
            Value : product.productName
        },
        Description : {
            $Type : 'UI.DataField',
            Value : product.product
        }
    },
    UI.LineItem #Inventories : [
        {
            $Type : 'UI.DataField',
            Value : stockNumber
        },
        {
            $Type : 'UI.DataField',
            Value : department_ID
        },
        {
            $Type : 'UI.DataFieldForAnnotation',
            Target : '@UI.Chart#ChartInventories',
            @HTML5.CssDefaults : {
                $Type : 'HTML5.CssDefaultsType',
                width : '10rem',
            },
            Label : 'Target',
        },
        {
            $Type : 'UI.DataField',
            Value : quantity,
        },
        {
            $Type : 'UI.DataFieldForAction',
            Action : 'Products.setStock',
            Label: 'Set Stock',
            Inline : true
        },
    ],
    UI.FieldGroup #InventoryInformation : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Value : stockNumber,
            },
            {
                $Type : 'UI.DataField',
                Value : department_ID
            },
            {
                $Type : 'UI.DataField',
                Value : min
            },
            {
                $Type : 'UI.DataField',
                Value : max
            },
            {
                $Type : 'UI.DataField',
                Value : target
            },
            {
                $Type : 'UI.DataField',
                Value : quantity,
            },
        ]
    },
    UI.DataPoint #Umbral : {
        $Type : 'UI.DataPointType',
        Value: quantity,
        MinimumValue : min,
        MaximumValue : max,
        CriticalityCalculation : {
            $Type : 'UI.CriticalityCalculationType',
            ImprovementDirection : #Maximize,
            ToleranceRangeLowValue : 200,
            DeviationRangeLowValue : 100,
        }
    },
    UI.Chart #ChartInventories: {
        $Type : 'UI.ChartDefinitionType',
        ChartType : #Bullet,
        Measures : [
            target
        ],
        MeasureAttributes : [
            {
                $Type : 'UI.ChartMeasureAttributeType',
                DataPoint : '@UI.DataPoint#Umbral',
                Measure : target
            },
        ],
    },
    UI.Facets  : [
        {
            $Type : 'UI.ReferenceFacet',
            Target : '@UI.FieldGroup#InventoryInformation',
            Label : 'Invetory'
        }
    ],
);