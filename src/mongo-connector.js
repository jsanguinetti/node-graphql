const { MongoClient } = require('mongodb');

// 1
const MONGO_URL = process.env.MONGO_URL;

// 2
module.exports = async () => {
  const db = await MongoClient.connect(MONGO_URL);
  return { Links: db.collection('links') };
}
