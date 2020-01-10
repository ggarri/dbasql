// @flow

/**
 * Created by ggarrido on 31/05/17.
 */

const _ = require('lodash');

const { AssociationTypes }      = require('../utils/schema');
const MsaError: Function        = require('../utils/error');


class SequelizeModelFactory implements dbase7ql$ModelFactoryInterface {
    defaultOptions: { schema: string, freezeTableName: boolean, underscored: boolean};

    constructor() {
        this.defaultOptions = {
            schema: 'public',
            freezeTableName: true,
            underscored: true
        };
    }

    init(schema: dbase7ql$modelSchema, sequelize: dbase7ql$Connector): dbase7ql$OrmModel {
        if (!schema.name && schema.tableName) throw new MsaError('Missing schema properties {name, tableName...}');
        const modelName: string = this.getModelName(schema);
        const attributes: Array<sequelize$attribute> = this.getAttributes(schema);
        const options = this.getOptions(schema);
        console.log(`Sequelize model ${modelName} init`);
        return sequelize.define(modelName, attributes, options);
    }

    associate(schema: dbase7ql$modelSchema, models: dbase7ql$OrmModel): dbase7ql$OrmModel {
        const modelName: string = this.getModelName(schema);
        console.log(`Sequelize model ${modelName} associate`);
        const seqModel: dbase7ql$OrmModel = this.searchModel(modelName, models);
        if (!seqModel) throw new MsaError(`Model definition ${modelName} was not found`);

        _.forEach(this.getAssociations(schema), (associationProps: Object) => {
            const { type, relName, target, options }: {
                type: string, relName: string, target: sequelize$modelTarget, options: Object
            } = associationProps;
            const seqRelModel: dbase7ql$OrmModel = this.searchModel(relName, models);
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

    getAttributes(schema: dbase7ql$modelSchema): Array<sequelize$attribute> {
        return _.mapValues(
            _.reduce(
                _.get(schema, 'attributes', {}),
                (result: Object, value: any, key: string): Object => {
                    if (!value.references) result[key] = value;
                    return result;
                }, {}
            ), (attrDef: Object, attrName: string): sequelize$attribute => {
                const attribute: sequelize$attribute = {
                    type: attrDef.type,
                    field: attrDef.column || _.snakeCase(attrName),
                    primaryKey: attrDef.isPrimaryKey || false,
                };
                if(attrDef.isPrimaryKey) attribute.autoIncrement = true;
                return attribute;
            }
        );
    }

    getOptions(schema: dbase7ql$modelSchema): Object {
        return _.merge(this.defaultOptions, { tableName: this.getTableName(schema) }, schema.options);
    }

    getTableName(schema: dbase7ql$modelSchema): string {
        return schema.tableName || _.snakeCase(schema.name);
    }

    getModelName(schema: dbase7ql$modelSchema): string {
        return schema.name || _.camelCase(schema.tableName);
    }

    searchModel(modelName: string, models: dbase7ql$mapOrmModel): dbase7ql$mapOrmModel {
        let seqModel: dbase7ql$OrmModel = models[modelName];
        if (!seqModel) seqModel = models[_.camelCase(modelName)];
        if (!seqModel) seqModel = models[_.snakeCase(modelName)];
        return seqModel;
    }

    getAssociations(schema: dbase7ql$modelSchema): Array<sequelize$association> {
        // Extract attributes with referencing another table
        const relations: Object = _.reduce(
            (schema.attributes || {}),
            (result: Object, value: any, key: string): Object => {
                if (value.references) result[key] = value;
                return result;
            }, {}
        );

        const seqRelations: sequelize$mapAssociations = _.mapValues(
            relations,
            (attrProp: Object, attrName: string): sequelize$association => {
                const referenceProp: Object = attrProp.references;
                const associationType: string = referenceProp.associationType; // @TODO: Map ours with Sequelize

                let target: sequelize$modelTarget;
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
