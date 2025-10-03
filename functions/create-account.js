// Netlify function: create-account using MongoDB
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { MongoClient, ServerApiVersion } = require('mongodb');

const MONGO_URI = process.env.MONGO_CONNECTION;
const INITIAL_BALANCE = parseInt(process.env.INITIAL_BALANCE || '10000', 10);

exports.handler = async function(event) {
  console.log('Received request:', event.httpMethod, event.body);

  if (event.httpMethod !== 'POST') {
    console.log('Method not allowed');
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  const { phone, displayName } = JSON.parse(event.body || '{}');
  console.log('Parsed body:', { phone, displayName });

  if (!phone || !displayName) {
    console.log('Missing phone or displayName');
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
    console.log('Connected to MongoDB');
    const db = client.db('winwin');
    const accounts = db.collection('accounts');

    // Check for duplicate displayName
    const existing = await accounts.findOne({ displayName });
    if (existing) {
      console.log('DisplayName exists:', displayName);
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
    console.log('Creating account:', account);
    await accounts.insertOne(account);

    console.log('Account created successfully');
    return {
      statusCode: 200,
      body: JSON.stringify(account)
    };
  } catch (err) {
    console.error('DB error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: 'DB error', details: err.message }) };
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
};
