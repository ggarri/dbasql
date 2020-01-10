// @flow

/**
 * Created by ggarrido on 18/05/17.
 */


const _             = require('lodash');
const dot           = require('dot-object');
const queryHandler: dbase7ql$queryHandler  = require('./utils/queryHandler');

class DataService {
    models: dbase7ql$mapOrmModel;

    constructor(models: dbase7ql$mapOrmModel) {
        this.models = models;
    }

    async fetchAll(
        modelName: string,
        query: dbase7ql$apiQuery = {},
        instanced: boolean = false
    ): Promise<Array<dbase7ql$modelObject>> {
        const model: dbase7ql$OrmModel = this._getEntityModel(modelName);
        const seqQueryParams: Object = queryHandler.getSequelizeQuery(model, query);
        seqQueryParams.raw = !instanced;
        const data: Array<dbase7ql$modelObject> = await model.findAll(seqQueryParams);
        return instanced ? data : data.map(dot.object);
    }

    async fetchOne(
        modelName: string,
        modelId: number,
        instanced: boolean = false
    ): Promise<dbase7ql$modelObject> {
        const model: dbase7ql$OrmModel = this._getEntityModel(modelName);
        const data: dbase7ql$modelObject = await model.findById(modelId, { raw: !instanced });
        if(_.isEmpty(data)) return null;
        return instanced ? data : dot.object(data);
    }

    async update(
        modelName: string,
        modelId: number,
        attributes: Object
    ): Promise<dbase7ql$modelObject> {
        const entityObj: dbase7ql$modelObject = await this.fetchOne(modelName, modelId, true);
        if (!entityObj) throw new Error(`Entity ${modelName} with id ${modelId} does not exists.`);
        entityObj.set(attributes);
        return entityObj.save();
    }

    create(
        modelName: string,
        attributes: Object
    ): dbase7ql$modelObject {
        const model: dbase7ql$OrmModel = this._getEntityModel(modelName);
        return model.build(attributes);
    }

    async createAndSave(
        modelName: string,
        attributes: Object
    ): Promise<dbase7ql$modelObject> {
        const row = this.create(modelName, attributes);
        return row.save();
    }

    async destroy(
        modelName: string,
        entityId: number
    ): Promise<boolean> {
        const entityObj: dbase7ql$modelObject = await this.fetchOne(modelName, entityId, true);
        if(!entityObj) return false;
        const numberRowsDeleted = await entityObj.destroy();
        return numberRowsDeleted !== 0;
    }

    _getEntityModel(modelName: string): dbase7ql$OrmModel {
        return this.models[_.camelCase(modelName)];
    }
}

module.exports = DataService;
