require('dotenv').config();
(async function(){
  try {
    const { Client } = require('pg');
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    const res = await client.query("select column_name,data_type from information_schema.columns where table_name='app_state'");
    console.log('columns:', JSON.stringify(res.rows, null, 2));
    await client.end();
  } catch (e) {
    console.error('ERROR:', e && e.message ? e.message : e);
    process.exit(2);
  }
})();
