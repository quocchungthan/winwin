// Netlify function: create-account using MongoDB
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { MongoClient, ServerApiVersion } = require('mongodb');

const MONGO_URI = process.env.MONGO_CONNECTION;
const INITIAL_BALANCE = parseInt(process.env.INITIAL_BALANCE || '10000', 10);

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  const { phone, displayName } = JSON.parse(event.body || '{}');
  if (!phone || !displayName) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing phone or displayName' }) };
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
    const db = client.db('winwin');
    const accounts = db.collection('accounts');

    // Check for duplicate displayName
    const existing = await accounts.findOne({ displayName });
    if (existing) {
      return { statusCode: 409, body: JSON.stringify({ error: 'Tên đã tồn tại.' }) };
    }

    // Create new account
    const guid = 'xxxx-xxxx-xxxx'.replace(/[x]/g, () => ((Math.random()*36)|0).toString(36));
    const account = {
      guid,
      phone,
      displayName,
      balance: INITIAL_BALANCE,
      mockFlag: false
    };
    await accounts.insertOne(account);

    return {
      statusCode: 200,
      body: JSON.stringify(account)
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: 'DB error', details: err.message }) };
  } finally {
    await client.close();
  }
};
