// 

/**
 * Created by ggarrido on 18/05/17.
 */


const _             = require('lodash');
const DbaseqlError  = require('./error');

function getOrderValue(orderQuery) {
    return orderQuery;
}

    
function getAttributeValue(columnQuery) {
    if (_.indexOf(columnQuery, '*') !== -1) return [];
    return typeof columnQuery !== 'undefined' ? columnQuery : [];
}

function getWhereValue(whereQuery) {
    const sequelizeQuery = {};
    _.forEach(whereQuery, (whereDef) => {
        if (_.isArray(whereDef)) {
            sequelizeQuery['$or'] = _.map(whereDef, whereDefOr => getWhereValue([whereDefOr]));
        } else {
            if (!sequelizeQuery[`${whereDef.$col}`]) {
                sequelizeQuery[`${whereDef.$col}`] = {};
            }
            sequelizeQuery[`${whereDef.$col}`][`$${whereDef.$type}`] = whereDef.$value;    
        }
    });
    
    return sequelizeQuery;
}

function getIncludeValue(model, queryWith) {
    return _.map(queryWith, (relQuery, relName) => {
        if (!model.associations[relName]) throw new DbaseqlError(`Association ${relName} not found`);
        const targetModel = model.associations[relName].target;
        return _.merge({
            model: targetModel,
            as: relName,
        }, getSequelizeQuery(targetModel, relQuery));
    });
}

function getSequelizeQuery(model, query) {
    // Remove empty object and arrays
    return _.pickBy({
        attributes: query.columns ? getAttributeValue(query.columns) : [],
        include: query.with ? getIncludeValue(model, query.with) : [],
        where: query.where ? getWhereValue(query.where) : {},
        order: query.order ? getOrderValue(query.order) : [],
    }, (value) => (
        typeof value !== 'undefined' && (
            (_.isArray(value) && value.length > 0) || (_.isObject(value) && _.values(value).length > 0)
        )
    ));
}

module.exports = {
    getIncludeValue,
    getAttributeValue,
    getSequelizeQuery,
};
