
const express       = require('express');
const dbApiService  = require('app/dbApiService');

const router = express.Router();

router.param('id', function (req, res, next, id) {
    console.log('CALLED ONLY ONCE');
    next();
});


/* GET all users */
router.get('/', async (req, res) => {
    let { query } = req.query;
    const dataProvider = await dbApiService.getDataProvider('pool_name', 'schema_name');
    try {
        query = query ? JSON.parse(query) : {};
        const output = await dataProvider.fetchAll('user', query);
        res.send(output);     
    } catch (err) {
        res.status(500).send(err.message);
        throw err;
    }
});

/* GET user by id */
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    const dataProvider = await dbApiService.getDataProvider('pool_name', 'schema_name');
    try {
        const output = await dataProvider.fetchOne('user', parseInt(id));
        res.send(output);     
    } catch (err) {
        res.status(500).send(err.message);
        throw err;
    }
});

/* PUT Update an user by id*/
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { attributes } = req.query;
    const dataProvider = await dbApiService.getDataProvider('pool_name', 'schema_name');
    try {
        const output = await dataProvider.update('user', parseInt(id), JSON.parse(attributes));
        res.send(output);    
    } catch (err) {
        res.status(500).send(err.message);
        throw err;
    }
});

/* POST Create an user*/
router.post('/', async (req, res) => {
    const { attributes } = req.query;
    const dataProvider = await dbApiService.getDataProvider('pool_name', 'schema_name');
    try {
        const output = await dataProvider.createAndSave('user', JSON.parse(attributes));
        res.send(output);
    } catch (err) {
        res.status(500).send(err.message);
        throw err;
    }
});

/* GET user by id */
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const dataProvider = await dbApiService.getDataProvider('pool_name', 'schema_name');
    try {
        const output = await dataProvider.destroy('user', parseInt(id));
        res.send(output ? 'User was deleted successfully' : 'Nothing was deleted');
    } catch (err) {
        res.status(500).send(err.message);
        throw err;
    }
});

module.exports = router;
