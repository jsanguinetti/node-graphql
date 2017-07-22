module.exports = {
  Query: {
    allLinks: async (root, data, { mongo: {Links} }) => {
      return await Links.find({}).toArray();
    },
  },
  Mutation: {
    createLink: async (root, data, {mongo: {Links}}) => {
      const response = await Links.insert(data);
      return data;
    },
  },
  Link: {
    id: root => root._id || root.id,
  },
};
