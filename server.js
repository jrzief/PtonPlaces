const { ApolloServer } = require("apollo-server");

/* new ApolloServer({
  typeDefs: "",
  resolvers: ""
}); */

const typeDefs = require("./typeDefs");
const resolvers = require("./resolvers");
const { findOrCreateUser } = require("./controllers/userController");

const mongoose = require("mongoose");
require("dotenv").config();

mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true })
  .then(() => console.log("DB connected"))
  .catch(err => console.error(err));

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    let authtoken = null;
    let currentUser = null;
    try {
      authtoken = req.headers.authorization;
      if (authtoken) {
        // find or create user
        currentUser = await findOrCreateUser(authtoken);
      }
    } catch (err) {
      console.error(`Unable to authenticate user with ${authtoken}`);
    }
    return { currentUser };
  }
});

server.listen({ port: process.env.PORT || 4000 }).then(({ url }) => {
  console.log(`Server listening on ${url}`);
});
