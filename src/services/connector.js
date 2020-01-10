// @flow

/**
 * Created by ggarrido on 16/05/17.
 */


const _             = require('lodash');

const Sequelize     = require('sequelize');
const DbaseqlError  = require('../utils/error');


class ConnectorService implements dbase7ql$ConnectorServiceInterface {
    dbPool: Object;
    dbConfigUpdates: Object;
    connections: dbase7ql$mapOrmModel;

    constructor({ connections }: {connections: dbase7ql$mapOrmModel}) {
        this.dbPool = {};
        this.dbConfigUpdates = {};
        this.connections = connections;
    }

    getConnection(poolName: string): Promise<dbase7ql$Connector> {
        if (!this.dbPool[poolName]) {
            const dbConfig: Object = this.getDbConfig(poolName);
            if (_.isUndefined(dbConfig)) throw new DbaseqlError(`Pool "${poolName}" does not exists`);
            this.dbPool[poolName] = ConnectorService.initDbConn(dbConfig);
        }

        return this.dbPool[poolName];
    }

    updateConnection(poolName: string, newParams: Object): boolean {
        this.dbConfigUpdates[poolName] = newParams;
        const exists: boolean = typeof this.dbPool[poolName] === 'object';
        if (!exists) return false;
        delete this.dbPool[poolName];
        return true;
    }

    getDbConfig(poolName: string): Object {
        return _.merge(this.connections[poolName], this.dbConfigUpdates[poolName] || {});
    }

    static initDbConn(
        { user, pass, dbName, host, connector, port }: { user: string, pass: string, dbName: string, host: string, connector: string, port: number}
    ): Promise<dbase7ql$Connector> {
        const dbConn: dbase7ql$Connector = new Sequelize(dbName, user, pass, {
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
