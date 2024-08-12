import mysql from 'mysql2';

// Create a connection to the database
const connection = mysql.createConnection({
  host: '65.21.186.60',
  user: 'newuser',
  password: '@Spark2020',
  database: 'ozonesenderShopify'
});

// Connect to the database
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the database.');

  // Attempt a query to check if the connection is working
  connection.query('SELECT 1 + 1 AS solution', (error, results, fields) => {
    if (error) {
      console.error('Error executing query:', error);
      return;
    }
    console.log('MySQL connection is working. Result:', results[0].solution);
  });

  // Close the connection
  connection.end();
});

export default connection;

