
const User = `
  type User {
    id: Int!
    firstname: String
    lastname: String
    username: String
    email: String
    password: String
    lastLogin: String
    active: Boolean!
    createdAt: String
    deleted: Boolean!
    extras: [Extra]
  }
`;

module.exports = () => [User];
