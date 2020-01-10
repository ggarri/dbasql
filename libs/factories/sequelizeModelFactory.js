// 

/**
 * Created by ggarrido on 31/05/17.
 */

const _ = require('lodash');

const { AssociationTypes }      = require('../utils/schema');
const MsaError        = require('../utils/error');


class SequelizeModelFactory {

    constructor() {
        this.defaultOptions = {
            schema: 'public',
            freezeTableName: true,
            underscored: true
        };
    }

    init(schema, sequelize) {
        if (!schema.name && schema.tableName) throw new MsaError('Missing schema properties {name, tableName...}');
        const modelName = this.getModelName(schema);
        const attributes = this.getAttributes(schema);
        const options = this.getOptions(schema);
        console.log(`Sequelize model ${modelName} init`);
        return sequelize.define(modelName, attributes, options);
    }

    associate(schema, models) {
        const modelName = this.getModelName(schema);
        console.log(`Sequelize model ${modelName} associate`);
        const seqModel = this.searchModel(modelName, models);
        if (!seqModel) throw new MsaError(`Model definition ${modelName} was not found`);

        _.forEach(this.getAssociations(schema), (associationProps) => {
            const { type, relName, target, options } = associationProps;
            const seqRelModel = this.searchModel(relName, models);
            if (!seqRelModel) throw new Error(`Model ${relName} not found`);
            switch (type) {
                case AssociationTypes.ONE_TO_ONE:
                    seqModel.hasOne(seqRelModel, target, options);
                    break;
                case AssociationTypes.MANY_TO_ONE:
                    seqModel.belongsTo(seqRelModel, target, options);
                    break;
                case AssociationTypes.ONE_TO_MANY:
                    seqModel.hasMany(seqRelModel, target, options);
                    break;
                case AssociationTypes.MANY_TO_MANY:
                    seqModel.belongsToMany(seqRelModel, target, options);
                    break;
                default:
                    throw new MsaError(`Relation type ${type} is not implemented`);
            }
        });
        return seqModel;
    }

    getAttributes(schema) {
        return _.mapValues(
            _.reduce(
                _.get(schema, 'attributes', {}),
                (result, value, key) => {
                    if (!value.references) result[key] = value;
                    return result;
                }, {}
            ), (attrDef, attrName) => {
                const attribute = {
                    type: attrDef.type,
                    field: attrDef.column || _.snakeCase(attrName),
                    primaryKey: attrDef.isPrimaryKey || false,
                };
                if(attrDef.isPrimaryKey) attribute.autoIncrement = true;
                return attribute;
            }
        );
    }

    getOptions(schema) {
        return _.merge(this.defaultOptions, { tableName: this.getTableName(schema) }, schema.options);
    }

    getTableName(schema) {
        return schema.tableName || _.snakeCase(schema.name);
    }

    getModelName(schema) {
        return schema.name || _.camelCase(schema.tableName);
    }

    searchModel(modelName, models) {
        let seqModel = models[modelName];
        if (!seqModel) seqModel = models[_.camelCase(modelName)];
        if (!seqModel) seqModel = models[_.snakeCase(modelName)];
        return seqModel;
    }

    getAssociations(schema) {
        // Extract attributes with referencing another table
        const relations = _.reduce(
            (schema.attributes || {}),
            (result, value, key) => {
                if (value.references) result[key] = value;
                return result;
            }, {}
        );

        const seqRelations = _.mapValues(
            relations,
            (attrProp, attrName) => {
                const referenceProp = attrProp.references;
                const associationType = referenceProp.associationType; // @TODO: Map ours with Sequelize

                let target;
                switch (referenceProp.associationType) {
                    case AssociationTypes.ONE_TO_ONE:
                        target = {
                            foreignKey: attrProp.referencedBy,
                            targetKey: referenceProp.targetKey || 'id',
                            as: referenceProp.as || attrName,
                        };
                        break;
                    case AssociationTypes.MANY_TO_ONE:
                        target = {
                            foreignKey: attrProp.column || attrName,
                            targetKey: referenceProp.targetKey || 'id',
                            as: referenceProp.as || attrName,
                        };
                        break;
                    case AssociationTypes.ONE_TO_MANY:
                        target = {
                            foreignKey: referenceProp.referencedBy,
                            targetKey: referenceProp.targetKey || 'id',
                            as: referenceProp.as || attrName,
                        };
                        break;
                    case AssociationTypes.MANY_TO_MANY:
                        target = {
                            foreignKey: referenceProp.referencedBy || 'id',
                            targetKey: referenceProp.targetKey || 'id',
                            as: referenceProp.as || attrName,
                        };
                        break;
                    default:
                        throw new MsaError(`Association type "${referenceProp.associationType}" invalid`);
                }

                return {
                    type: associationType,
                    relName:  referenceProp.model || _.camelCase(referenceProp.table),
                    target,
                    options: referenceProp.options || {},
                };
            }
        );

        return _.values(seqRelations);
    }
}

module.exports = SequelizeModelFactory;
