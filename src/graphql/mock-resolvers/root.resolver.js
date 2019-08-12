/* eslint-disable import/no-extraneous-dependencies */
const faker = require("faker")

function randomArray(min, max, callback) {
  const size = faker.random.number({min, max})
  return Array.from({length: size}, callback)
}

module.exports = {
  Query: {
    authors() {
      return randomArray(2, 20, () => {
        const firstName = faker.name.firstName()
        const lastName = faker.name.lastName()

        return {
          firstName,
          lastName,
          books: randomArray(1, 8, () => ({
            title: faker.commerce.productName(),
            author: `${firstName} ${lastName}`
          }))
        }
      })
    },
    books() {
      return randomArray(2, 20, () => ({
        title: faker.commerce.productName(),
        author: `${faker.name.firstName()} ${faker.name.lastName()}`
      }))
    }
  }
}
