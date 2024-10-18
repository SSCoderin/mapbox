const express = require('express');
const mysql = require('mysql2');
const cors = require('cors'); // To allow cross-origin requests from React frontend

const app = express();
app.use(cors());
app.use(express.json()); // For parsing application/json

// MySQL connection setup
const db = mysql.createConnection({
  host: '127.0.0.1',  // Update with your host
  user: 'root',       // Update with your username
  password: 'Spider123',  // Update with your password
  database: 'wayport'   // Your database name
});

// Route to get latitude and longitude for source and destination cities
app.post('/get-coordinates', (req, res) => {
  const { sourceCity, destinationCity } = req.body;

  const sourceQuery = `
    SELECT city_name, latitude, longitude 
    FROM wayport.trains_tbl 
    WHERE city_name = ?;
  `;

  const destinationQuery = `
    SELECT city_name, latitude, longitude 
    FROM wayport.trains_tbl 
    WHERE city_name = ?;
  `;

  // First, get the source city coordinates
  db.query(sourceQuery, [sourceCity], (err, sourceResults) => {
    if (err) {
      console.error('Error querying the source city:', err);
      return res.status(500).send('Server error');
    }

    // Check if the source city is found
    if (sourceResults.length > 0) {
      const source = sourceResults[0]; // Get the first result for source city

      // Then, get the destination city coordinates
      db.query(destinationQuery, [destinationCity], (err, destinationResults) => {
        if (err) {
          console.error('Error querying the destination city:', err);
          return res.status(500).send('Server error');
        }

        // Check if the destination city is found
        if (destinationResults.length > 0) {
          const destination = destinationResults[0]; // Get the first result for destination city

          // Return both source and destination coordinates
          res.json({
            sourceCity: { 
              city_name: source.city_name, 
              latitude: source.latitude, 
              longitude: source.longitude 
            },
            destinationCity: { 
              city_name: destination.city_name, 
              latitude: destination.latitude, 
              longitude: destination.longitude 
            }
          });
          console.log('Coordinates sent successfully');
        } else {
          res.status(404).send('Destination city not found');
          console.log('Destination city not found');
        }
      });
    } else {
      res.status(404).send('Source city not found');
      console.log('Source city not found');
    }
  });
});

// Start the server with dynamic port input
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
