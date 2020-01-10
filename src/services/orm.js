// @flow

/**
 * Created by ggarrido on 16/05/17.
 */

const _            = require('lodash');
const loadSchemas  = require('../utils/loadSchemas');


class OrmService implements dbase7ql$OrmServiceInterface {

    connectorService: dbase7ql$ConnectorServiceInterface;
    modelFactoryService: dbase7ql$ModelFactoryInterface;
    modelSchemas: dbase7ql$mapModelSchema;
    ormModels: Object;

    constructor(
        { connectorService, modelFactory, modelSchemas }: {connectorService: dbase7ql$ConnectorServiceInterface, modelFactory: dbase7ql$ModelFactoryInterface, modelSchemas: dbase7ql$mapModelSchema}
    ) {
        this.connectorService = connectorService;
        this.modelFactoryService = modelFactory;
        this.modelSchemas = modelSchemas;
        this.ormModels = {};
    }

    async getModels(poolName: string, schemaName: string): dbase7ql$mapOrmModel {
        if (!this.modelSchemas[schemaName]) throw new Error(`Schema "${schemaName}" is not defined`);
        if (!this.ormModels[poolName]) this.ormModels[poolName] = {};
        if (!this.ormModels[poolName][schemaName]) {
            this.ormModels[poolName][schemaName] = await this.connectorService.getConnection(poolName)
                .then((dbConn: dbase7ql$Connector): Promise<Array<dbase7ql$OrmModel>> =>
                    this._loadModels(dbConn, this.modelFactoryService, this.modelSchemas[schemaName])
                );
        }

        return this.ormModels[poolName][schemaName];
    }

    async _loadModels(
        dbConn: dbase7ql$Connector,
        factory: dbase7ql$ModelFactoryInterface,
        modelSchemas: dbase7ql$mapModelSchema
    ): Promise<dbase7ql$mapOrmModel> {
        const models: dbase7ql$mapOrmModel = _.mapValues(
            modelSchemas,
            (schema: dbase7ql$modelSchema, schemaName: string): dbase7ql$OrmModel => {
                if (!schema.name) schema.name = schemaName;
                return factory.init(schema, dbConn);
            }
        );

        _.forEach(modelSchemas, (schema: dbase7ql$modelSchema): dbase7ql$OrmModel => factory.associate(schema, models));
        return models;
    }
}

module.exports = OrmService;
