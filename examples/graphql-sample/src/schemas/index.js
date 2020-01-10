
const _ = require('lodash');
const { makeExecutableSchema } = require('graphql-tools');

const User = require('./user');
const Extra = require('./extra');
const ExtraType = require('./extraType');

const Query = `
    type Query {
        user(id: Int!): User
        users: [User]
        extras: [Extra]
        extraTypes: [ExtraType]
    }
`;

const users = [
    { id: 1, username: 'azappella', password: '123', firstname: 'Andrew', lastname: 'Zappella', active: true, created_at: '2018-04-03 12:13:07.551845', last_login: null, deleted: false },
    { id: 2, username: 'bstebler', password: '123', firstname: 'Bono', lastname: 'Stebler', active: true, created_at: '2018-04-03 12:13:07.551845', last_login: null, deleted: false },
    { id: 3, username: 'ggarrido', password: '123', firstname: 'Gabriel', lastname: 'Garrido', active: true, created_at: '2018-04-03 12:13:07.551845', last_login: null, deleted: false },
];
const extras = [
    { id: 1, seller_id: 1, extra_type_id: 2, name: 'Pizza', amount: 20.00, effective_date: '2018-04-03', deleted: true },
    { id: 2, seller_id: 1, extra_type_id: 2, name: 'Burger', amount: 19.00, effective_date: '2018-04-03', deleted: true },
    { id: 3, seller_id: 2, extra_type_id: 1, name: 'Mojito', amount: 10.00, effective_date: '2018-04-02', deleted: true },
    { id: 4, seller_id: 3, extra_type_id: 1, name: 'Shot', amount: 3.00, effective_date: '2018-03-03', deleted: true },
];
const extraTypes = [
    { id: 1, name: 'Bar' },
    { id: 2, name: 'Restaurant' },
    { id: 3, name: 'Room' },
];

const resolverMap = {
    Query: {
        user(obj, args, context, info) {
            return _.find(users, { id: args.id });
        },
        users: () => users,
        extras: () => extras,
        extraTypes: () => extraTypes,
    },
    User: {
        extras(user) {
            return _.filter(extras, { seller_id: user.id });
        },
    },
    Extra: {
        seller(extra) {
            return _.find(users, { id: extra.seller_id });
        },
        extraType(extra) {
            return _.find(extraTypes, { id: extra.extra_type_id });
        },
    },
};

const typeDefs = [Query, User, Extra, ExtraType];

const schema = makeExecutableSchema({
    typeDefs: typeDefs,
    resolvers: resolverMap,
});

module.exports = schema;
