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
        type: {
            column: 'type',
            type: Schema.DataTypes.STRING,
        },
    },
    name: 'extraType',
    tableName: 'extra_type',
};

