// 

/**
 * Created by ggarrido on 16/05/17.
 */

const _            = require('lodash');
const loadSchemas  = require('../utils/loadSchemas');


class OrmService {


    constructor(
        { connectorService, modelFactory, modelSchemas }
    ) {
        this.connectorService = connectorService;
        this.modelFactoryService = modelFactory;
        this.modelSchemas = modelSchemas;
        this.ormModels = {};
    }

    async getModels(poolName, schemaName) {
        if (!this.modelSchemas[schemaName]) throw new Error(`Schema "${schemaName}" is not defined`);
        if (!this.ormModels[poolName]) this.ormModels[poolName] = {};
        if (!this.ormModels[poolName][schemaName]) {
            this.ormModels[poolName][schemaName] = await this.connectorService.getConnection(poolName)
                .then((dbConn) =>
                    this._loadModels(dbConn, this.modelFactoryService, this.modelSchemas[schemaName])
                );
        }

        return this.ormModels[poolName][schemaName];
    }

    async _loadModels(
        dbConn,
        factory,
        modelSchemas
    ) {
        const models = _.mapValues(
            modelSchemas,
            (schema, schemaName) => {
                if (!schema.name) schema.name = schemaName;
                return factory.init(schema, dbConn);
            }
        );

        _.forEach(modelSchemas, (schema) => factory.associate(schema, models));
        return models;
    }
}

module.exports = OrmService;
