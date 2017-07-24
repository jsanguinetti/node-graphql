const { MongoClient, ObjectID } = require('mongodb');

// 1
const MONGODB_URI = process.env.MONGODB_URI;

// 2
module.exports = async () => {
  const db = await MongoClient.connect(MONGODB_URI);
  return {
    Links: db.collection('links'),
    Users: db.collection('users'),
    Votes: db.collection('votes'),
    ObjectID: ObjectID.createFromHexString
  };
}
