/**
 * Created by ggarrido on 12/06/17.
 */


const Sequelize = require('sequelize');

module.exports.AssociationTypes = {
    MANY_TO_ONE: 'many_to_one',
    ONE_TO_ONE: 'one_to_one',
    ONE_TO_MANY: 'has_one',
    MANY_TO_MANY: 'many_to_many',
};

// @TODO: Replace by our own syntax
module.exports.QueryTypes = Sequelize.QueryTypes;
module.exports.DataTypes = Sequelize.DataTypes;
