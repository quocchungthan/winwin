// Netlify function: check-username using MongoDB
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { MongoClient, ServerApiVersion } = require('mongodb');

const MONGO_URI = process.env.MONGO_CONNECTION;

function randomName() {
  return 'user' + Math.floor(Math.random() * 10000);
}

exports.handler = async function(event) {
  console.log('Received request:', event.queryStringParameters);

  const displayName = event.queryStringParameters.displayName;
  if (!displayName) {
    console.log('Missing displayName');
    return {
      statusCode: 400,
      body: JSON.stringify({ available: false, error: 'Missing displayName' })
    };
  }

  const client = new MongoClient(MONGO_URI, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });

  try {
    await client.connect();
    console.log('Connected to MongoDB');
    const db = client.db('winwin');
    const accounts = db.collection('accounts');

    const existing = await accounts.findOne({ displayName });
    if (existing) {
      console.log('DisplayName exists:', displayName);
      // Suggest a random name not in use
      let suggestion = '';
      let tries = 0;
      do {
        suggestion = randomName();
        const taken = await accounts.findOne({ displayName: suggestion });
        if (!taken) break;
        tries++;
      } while (tries < 10);

      console.log('Suggested name:', suggestion);
      return {
        statusCode: 200,
        body: JSON.stringify({ available: false, suggestion })
      };
    } else {
      console.log('DisplayName available:', displayName);
      return {
        statusCode: 200,
        body: JSON.stringify({ available: true, suggestion: '' })
      };
    }
  } catch (err) {
    console.error('DB error:', err);
    return { statusCode: 500, body: JSON.stringify({ available: false, error: 'DB error', details: err.message }) };
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
};
