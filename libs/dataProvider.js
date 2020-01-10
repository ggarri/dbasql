// 

/**
 * Created by ggarrido on 18/05/17.
 */


const _             = require('lodash');
const dot           = require('dot-object');
const queryHandler  = require('./utils/queryHandler');

class DataService {

    constructor(models) {
        this.models = models;
    }

    async fetchAll(
        modelName,
        query = {},
        instanced = false
    ) {
        const model = this._getEntityModel(modelName);
        const seqQueryParams = queryHandler.getSequelizeQuery(model, query);
        seqQueryParams.raw = !instanced;
        const data = await model.findAll(seqQueryParams);
        return instanced ? data : data.map(dot.object);
    }

    async fetchOne(
        modelName,
        modelId,
        instanced = false
    ) {
        const model = this._getEntityModel(modelName);
        const data = await model.findById(modelId, { raw: !instanced });
        if(_.isEmpty(data)) return null;
        return instanced ? data : dot.object(data);
    }

    async update(
        modelName,
        modelId,
        attributes
    ) {
        const entityObj = await this.fetchOne(modelName, modelId, true);
        if (!entityObj) throw new Error(`Entity ${modelName} with id ${modelId} does not exists.`);
        entityObj.set(attributes);
        return entityObj.save();
    }

    create(
        modelName,
        attributes
    ) {
        const model = this._getEntityModel(modelName);
        return model.build(attributes);
    }

    async createAndSave(
        modelName,
        attributes
    ) {
        const row = this.create(modelName, attributes);
        return row.save();
    }

    async destroy(
        modelName,
        entityId
    ) {
        const entityObj = await this.fetchOne(modelName, entityId, true);
        if(!entityObj) return false;
        const numberRowsDeleted = await entityObj.destroy();
        return numberRowsDeleted !== 0;
    }

    _getEntityModel(modelName) {
        return this.models[_.camelCase(modelName)];
    }
}

module.exports = DataService;
