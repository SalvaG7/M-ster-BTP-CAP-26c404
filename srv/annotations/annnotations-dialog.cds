using {Products as myservice} from '../service';

annotate myservice.VH_Options with {
    code @title : 'Options';
};


annotate myservice.dialog with {
    myOption @title : 'Option';
    myAmount @title : 'Amount';
};

annotate myservice.dialog with {
    myOption @Common: {
        ValueList : {
            $Type : 'Common.ValueListType',
            CollectionPath : 'VH_Options',
            Parameters : [
                {
                    $Type : 'Common.ValueListParameterInOut',
                    LocalDataProperty : myOption,
                    ValueListProperty : 'code'
                },
                {
                    $Type : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty : 'name'
                }
            ]
        }
    };
}
