/**
File auto-generated
**/

const Schema    = require('dbaseql/libs/utils/schema');

module.exports = {
    attributes: {
        id: {
            column: 'id',
            isNullable: false,
            isPrimaryKey: true,
            type: Schema.DataTypes.INTEGER,
        },
        amount: {
            column: 'amount',
            type: Schema.DataTypes.NUMERIC,
        },
        deleted: {
            column: 'deleted',
            default: false,
            isNullable: false,
            type: Schema.DataTypes.BOOLEAN,
        },
        effectiveDate: {
            column: 'effective_date',
            type: Schema.DataTypes.DATE,
        },
        name: {
            column: 'name',
            type: Schema.DataTypes.STRING,
        },
        user: {
            column: 'seller_id',
            references: {
                associationType: Schema.AssociationTypes.MANY_TO_ONE,
                model: 'user',
                table: 'user',
                targetKey: 'id',
            },
            type: Schema.DataTypes.INTEGER,
        },
        type: {
            column: 'type_id',
            references: {
                associationType: Schema.AssociationTypes.MANY_TO_ONE,
                model: 'extraType',
                table: 'extra_type',
                targetKey: 'id',
            },
            type: Schema.DataTypes.INTEGER,
        },
    },
    name: 'extra',
    tableName: 'extra',
};

