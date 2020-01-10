// 

/**
 * Created by ggarrido on 16/05/17.
 */


const _             = require('lodash');

const Sequelize     = require('sequelize');
const DbaseqlError  = require('../utils/error');


class ConnectorService {

    constructor({ connections }) {
        this.dbPool = {};
        this.dbConfigUpdates = {};
        this.connections = connections;
    }

    getConnection(poolName) {
        if (!this.dbPool[poolName]) {
            const dbConfig = this.getDbConfig(poolName);
            if (_.isUndefined(dbConfig)) throw new DbaseqlError(`Pool "${poolName}" does not exists`);
            this.dbPool[poolName] = ConnectorService.initDbConn(dbConfig);
        }

        return this.dbPool[poolName];
    }

    updateConnection(poolName, newParams) {
        this.dbConfigUpdates[poolName] = newParams;
        const exists = typeof this.dbPool[poolName] === 'object';
        if (!exists) return false;
        delete this.dbPool[poolName];
        return true;
    }

    getDbConfig(poolName) {
        return _.merge(this.connections[poolName], this.dbConfigUpdates[poolName] || {});
    }

    static initDbConn(
        { user, pass, dbName, host, connector, port }
    ) {
        const dbConn = new Sequelize(dbName, user, pass, {
            host: host || 'localhost',
            port: port || 5432,
            dialect: connector || 'postgres',
            define: {
                timestamps: false,
            },
            benchmark: true,
            pool: {
                max: 5,
                min: 0,
                idle: 10000,
            },
        });

        return Promise.resolve(dbConn);
    }
}

module.exports = ConnectorService;
