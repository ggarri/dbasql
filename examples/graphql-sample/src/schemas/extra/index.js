const Extra = `
  type Extra {
    id: Int!
    name: String
    amount: Float
    effectiveData: String
    extraType: ExtraType
    seller: User
    deleted: Boolean
  }
`;

module.exports = () => [Extra];