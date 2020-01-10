'use strict';

const fs            = require('fs');
const _             = require('lodash');
const path          = require('path');
const pgStructure   = require('pg-structure');

// const util          = require('util');
const jsonStringfy  = require('json-stable-stringify');
const beautify      = require('js-beautify').js_beautify;
const program       = require('commander');

const config = {};

const setupConfigEnv = (dbConf, outputConf) => {
    config.db = dbConf;
    config.output = outputConf;
};

const getConfig = itemPath => {
    return _.get(config, itemPath, null);
};


const getSchemaFolder = () => {
    const relativePath = getConfig('output.folder');
    if (!relativePath) throw new Error('Missing output path');
    return path.join(process.cwd(), relativePath);
};

const getModelName = tableName => {
    return _.camelCase(tableName);
};

/**
 * Creates output folder in case it does not exists
 */
const createOutputFolder = () => {
    const removeFolder = pathToRm => {
        fs.readdirSync(pathToRm).forEach(file => {
            const curPath = path.join(pathToRm, file);
            if (fs.lstatSync(curPath).isDirectory()) removeFolder(curPath);
            else fs.unlinkSync(curPath);
        });
        fs.rmdirSync(pathToRm);
    };

    const schemaPath = getSchemaFolder();
    if (!fs.existsSync(schemaPath)) {
        fs.mkdirSync(schemaPath);
    }

    console.log('Output : %s', schemaPath);

}

function getPgConn() {
    return pgStructure({
        database: getConfig('db.database'),
        user: getConfig('db.user'),
        password: getConfig('db.password'),
        host: getConfig('db.host'),
        port: getConfig('db.port'),
    }, [getConfig('db.schema')]);
}

const parseColumnType = (pgType, colName = null) => {
    switch (pgType) {
        case 'integer': return '%Schema.DataTypes.INTEGER%';
        case 'smallint': return '%Schema.DataTypes.INTEGER%';
        case 'numeric': return '%Schema.DataTypes.NUMERIC%';
        case 'character varying': return '%Schema.DataTypes.STRING%';
        case 'character': return '%Schema.DataTypes.STRING%';
        case 'timestamp without time zone': return '%Schema.DataTypes.DATE%';
        case 'time without time zone': return '%Schema.DataTypes.DATE%';
        case 'timestamp with time zone': return '%Schema.DataTypes.DATE%';
        case 'date': return '%Schema.DataTypes.DATE%';
        case 'boolean': return '%Schema.DataTypes.BOOLEAN%';
        case 'text': return '%Schema.DataTypes.TEXT%';
        case 'jsonb': return '%Schema.DataTypes.JSONB%';
        case 'array': return '%Schema.DataTypes.STRING%'; // @TODO Sequelize has issues
        case 'bytea': return '%Schema.DataTypes.BLOB%';
        case 'user-defined': return '%Schema.DataTypes.STRING%';
        default:
            throw new Error(`Type "${pgType}" is not parsed (${colName})`);
    }
};

/**
 * Generates all model files.
 * @private
 * @param {object} dbConn - pg-structure db object
 */
function generateModelObjects(dbConn) {
    const tables = dbConn.schemas.get(getConfig('db.schema')).tables;
    const onlyTable = getConfig('output.onlyTable');

    const models = _.mapKeys(
        _.filter(tables.array, table => !onlyTable || (onlyTable && onlyTable === table.name)),
        table => getModelName(table.name)
    );

    return _.mapValues(models, table => {
        console.log(`Parsing "${table.name}...`);
        const schema = {
            name: getModelName(table.name),
            tableName: table.name,
        };

        schema.attributes = _.mapValues(
            _.mapKeys(table.columns.array, column => _.camelCase(column.name)),
            column => {
                const attribute = {
                    type: parseColumnType(column.type, column.name),
                    column: column.name,
                };

                if (column.isPrimaryKey) attribute.isPrimaryKey = column.isPrimaryKey;
                if (column.notNull) attribute.isNullable = false;
                if (column.default && !column.isPrimaryKey && column.default.indexOf('::') === -1) {
                    if (column.type === 'boolean') attribute.default = column.defaultWithTypeCast === 'true';
                    else attribute.default = column.default;
                }
                return attribute;
            }
        );

        table.o2mRelations.forEach(relation => {
            const FKColumn = [...relation.constraint.columns.values()][0];
            schema.attributes[`${relation.targetTable.name}s`] = {
                type: '%Schema.DataTypes.ARRAY%',
                references: {
                    associationType: '%Schema.AssociationTypes.ONE_TO_MANY%',
                    table: relation.targetTable.name,
                    model: getModelName(relation.targetTable.name),
                    referencedBy: FKColumn.name,
                },
            };
        });

        table.m2oRelations.forEach(relation => {
            const FKColumn = [...relation.constraint.columns.values()][0];       // COLUMN:      product_id  (from line_item table)
            const PKColumn = [...relation.targetTable.primaryKeyColumns.values()][0];  // COLUMN:      id          (from product table)
            schema.attributes[`${relation.targetTable.name}`] = {
                type: parseColumnType(FKColumn.type),
                column: FKColumn.name,
                references: {
                    associationType: '%Schema.AssociationTypes.MANY_TO_ONE%',
                    table: relation.targetTable.name,
                    model: getModelName(relation.targetTable.name),
                    targetKey: PKColumn.name,
                },
            };
        });

        console.log('Done');
        return schema;
    });
}


const createSchemaFile = (schemaName, schemaDef) => {
    const schemaPath = getSchemaFolder();
    const fd = fs.openSync(path.join(schemaPath, `${schemaName}.js`), 'w');
    // const parsedSchema = JSON.stringify(schema, null, 2);
    // let parsedSchema = util.inspect(schema, { showHidden: false, depth: null, });
    let parsedSchema = beautify(jsonStringfy(schemaDef), { indent_size: 4 });
    // parsedSchema = parsedSchema.replace(new RegExp('"%', 'g'), '');
    // parsedSchema = parsedSchema.replace(new RegExp('%"', 'g'), '');
    parsedSchema = parsedSchema.replace(/\"%([^(\")"]+)%\"/g, '$1');
    parsedSchema = parsedSchema.replace(/\"([^(\")"]+)\":/g, '$1:');
    parsedSchema = parsedSchema.replace(new RegExp('"', 'g'), '\'');
    const fileContent = `/**
File auto-generated
**/

const Schema    = require('dbaseql/libs/utils/schema');

module.exports = ${parsedSchema};

`;
    fs.writeFileSync(fd, fileContent, { flag: 'w' });
    fs.closeSync(fd);
};

/**
 * Generates model files for Sequelize ORM.
 * @param {object} outputConf - Convert table schema info into msa model
 * @param {object} dbConf - Database connection info
 */
const generate = async (dbConf, outputConf) => {
    setupConfigEnv(dbConf, outputConf);
    await createOutputFolder();
    const dbConn = await getPgConn();
    const models = await generateModelObjects(dbConn);
    _.forEach(models, (modelProp, modelName) => {
        createSchemaFile(modelName, modelProp);
    });
};


/**
  MAIN EXECUTION
**/

const options = {};
// Define options, help text
program
    .option('-h, --host [host]',                'IP address or host name of the database server')
    .option('    --port [port]',                'Port of database server to connect')
    .option('-d, --database [database]',        'Database name')
    .option('-u, --user [user](Mandatory)',                'Username to connect to database')
    .option('-p, --password [password](Mandatory)',        'Password to connect to database')
    .option('-s, --schema [schema]',            'Schema to read')
    .option('-o, --output [output](Mandatory)',            'Output folder')
    .option('-t, --table [only_table]',         'Model name to update')
;

program.on('--help', () => {
    console.log('  Connects given PostgreSQL database and generates MSA models');
    console.log('');
    console.log('  Examples:');
    console.log('');
    console.log('    $ %s -h 127.0.0.1 -d client_dev -u dev -p dev -s public -o ./src/schemas', process.argv[0]);
    console.log('');
});

program.parse(process.argv);

// Show help if no arguments are present.
if (process.argv.length === 2) { program.help(); }

// Copy all options to options global variable to override config.
['host', 'port', 'database', 'user', 'password', 'schema', 'output', 'table'].forEach(option => {
    if (program[option] !== undefined) options[option] = program[option];
});


if (!options.user) throw new Error('Missing argument --user');
if (!options.database) throw new Error('Missing argument --database');
if (!options.output) throw new Error('Missing argument --output');

generate({
    host: options.host || '127.0.0.1',
    port: options.port || 5432,
    database: options.database,
    user: options.user,
    password: options.password,
    schema: options.schema || 'public',
}, {
    folder: options.output,
    onlyTable: options.table,
}).then(() => {
    console.log('Finished');
});
