module.exports = {
  allLinks: async (root, data, { mongo: {Links} }) => {
    return await Links.find({}).toArray();
  },
};
