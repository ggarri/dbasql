// 

/**
 * Created by ggarrido on 16/05/17.
 */

const fs    = require('fs');
const _     = require('lodash');
const path  = require('path');

function loadSchemas(schemaScope) {
    const { schemaContext, schemaPath } = schemaScope; 
    const schemas = {};
    if (!fs.statSync(schemaPath)) throw new Error(`Folder "${schemaPath}" does not exists.`);
    const files = fs.readdirSync(schemaPath);
    _.forEach(files, file => {
        const filename = file.replace(/\.[^/.]+$/, '');
        // eslint-disable-next-line
        schemas[filename] = require(path.join(schemaContext, filename));
    });

    return schemas;
}

module.exports = loadSchemas;
