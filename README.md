# Dbaseql

Library aiming to provide an abstract layer to db access using 
Sequelize. Models are being defined using an customize model schemas
 which can be generated automatically from database.
  
  ## Install library
  To install the library from github repo runs:
```$xslt
npm install --save git+ssh://git@github.com/base7/dbaseql.git
```

  ## Generate schema (Optional - Only for Postgresql)
  
  Once library has been installed, you can generate the schema directly
  from your database in a single command:
  
```$xslt
node ./node_modules/.bin/dbaseql-generate-schema -o {output_folder} -u {db_username} -p {db_password} -d {db_name}
```

## How to use

First we need to defined a connector service which provides our db pool connection. We can defined several
connection at ones:

### Defining ConnectorService (and using)

```flow js
const ConnectorService = require('dbaseql/libs/services/connector');
const connectorService = new ConnectorService({
    connections: {
        pool_1: {
            connector: parameters.db_driver,
            host: parameters.db_host,
            user: parameters.db_user,
            pass: parameters.db_pass,
            dbName: parameters.db_name,
        },
        pool_2: {
            connector: parameters.db_driver,
            host: parameters.db_host,
            user: parameters.db_user,
            pass: parameters.db_pass,
            dbName: parameters.db_name,
        },
    },
});

const conn = connectorService.getConnection('pool_1');
conn.query('SELECT ....');
```

### Define ORM service

Our OrmService will be composed by two parts: model schemas and pool connections. Thus we will be able to
link same schema on different db pools and the other way around too.
 
 To define the orm schemas, we need to pass the absolute path where schemas had been placed(`schemaPath``), 
 also context for requiring them will need to be required (GLOBAL REQUIRE PATH).
 
 ```flow js
const loadSchemas = require('dbaseql/libs/utils/loadSchemas');

const schemas = loadSchemas({
    schemaContext: 'app/schemas',
    schemaPath: path.join(__dirname, '../src/schemas'),
});
```

Now, once we have the schemas and the ConnectorService, we can defined the *OrmService* :
```flow js
const ModelFactory = require('dbaseql/libs/factories/sequelizeModelFactory');
const OrmService = require('dbaseql/libs/services/orm');

const ormService = new OrmService({
    modelFactory: new ModelFactory(),
    connectorService,
    modelSchemas: {
        schema_1: schemas,
    },
});
```

At last to be able to query our model based on the schemas we defined above *DataService* is provided. 
A `DataProvider` is instantiated based on a `pool_name` and `schema_name`;  
```flow js
const DataProvider = require('dbaseql/libs/dataProvider');

const models = await ormService.getModels('pool_1', 'schema_1');
const dataProvider = new DataProvider(models);
```

#### DataProvider Api

Available methods
```
    fetchAll(modelName: string, query: ApiQueryInterface, instanced: boolean): InstancedObject/Object;
    fetchOne(modelName: string, id: int, instanced: boolean): InstancedObject/Object;
    update(modelName: string, id: int, attributes: Object): InstancedObject;
    create(modelName: string, attributes: int): InstancedObject;
    createAndSave(modelName: string, attributes: int): InstancedObject;
    destroy(modelName:string, id: int, instanced: boolean): boolean;
```

ApiQueryInterface
```
{
    columns?: Array<string>,
    with?: {
        [key:string]: ApiQueryInterface // relation name
    },
    where?: Object,
    attributes?: Object,
}
```


## Express Sample Project

An example has been provided within `./examples/express-sample` folder.
See more [here](./examples/express-sample/README.md).

### Query samples `/{entity}/query=`:

```
{
    "columns": ["id", "name", "short_name"],
    "with": {
        "invoiceTemplate": {
            "columns": ["id", "name"],
            "where": [
                {"$col": "id, "$type": "eq", "$value": 1}
            ]
        }
    },
    "where": [
        {"$col": "id" "$type": "gte", "$value": 1},
        [{"$col": "id" "$type": "gte", "$value": 1}, {"$col": "id" "$type": "lte", "$value": 7}]
    ],
    "order": [["id", "DESC"]]
}
```
Equal
```
SELECT E.id, E.name, E.short_name, IT.id, IT.name 
FROM {entity} E 
LEFT JOIN InvoiceTemplate IT ON (IT.id = E.invoice_template_id AND id = 1)
WHERE E.id > 1 AND (E.id >= 1 OR E.id <= 7)
ORDER BY E.id DESC
```
Where types are the same Operator section of [sequelizejs](http://docs.sequelizejs.com/manual/tutorial/querying.html)






























