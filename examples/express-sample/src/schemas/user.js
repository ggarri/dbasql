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
        active: {
            column: 'active',
            default: false,
            isNullable: false,
            type: Schema.DataTypes.BOOLEAN,
        },
        createdAt: {
            column: 'created_at',
            type: Schema.DataTypes.DATE,
        },
        deleted: {
            column: 'deleted',
            default: false,
            isNullable: false,
            type: Schema.DataTypes.BOOLEAN,
        },
        email: {
            column: 'email',
            type: Schema.DataTypes.STRING,
        },
        extras: {
            references: {
                associationType: Schema.AssociationTypes.ONE_TO_MANY,
                model: 'extra',
                referencedBy: 'seller_id',
                table: 'extra',
            },
            type: Schema.DataTypes.ARRAY,
        },
        lastLogin: {
            column: 'last_login',
            type: Schema.DataTypes.DATE,
        },
        lastname: {
            column: 'lastname',
            type: Schema.DataTypes.STRING,
        },
        firstname: {
            column: 'firstname',
            type: Schema.DataTypes.STRING,
        },
        password: {
            column: 'password',
            type: Schema.DataTypes.STRING,
        },
        username: {
            column: 'username',
            type: Schema.DataTypes.STRING,
        },
    },
    name: 'user',
    tableName: 'user',
};

