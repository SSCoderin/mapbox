const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: '127.0.0.1',  // Update with your host
  user: 'root',       // Update with your username
  password: '0389',   // Update with your password
  database: 'closer'  // Correct database name
});

app.post('/get-coordinates', (req, res) => {
  const { sourceCity, destinationCity } = req.body;
  let query = ``;
    query += `
        SELECT 
          src.city_name AS source_city, 
          src.latitude AS source_latitude, 
          src.longitude AS source_longitude,
          dest.city_name AS destination_city, 
          dest.latitude AS destination_latitude, 
          dest.longitude AS destination_longitude,
          SUBSTRING_INDEX(src.nearest_a1, '@', 1) AS source_nearest_a1_name, 
          a1.latitude AS source_nearest_a1_lat, 
          a1.longitude AS source_nearest_a1_long,
          SUBSTRING_INDEX(src.nearest_a3, '@', 1) AS source_nearest_a3_name,
          a3.latitude AS source_nearest_a3_lat, 
          a3.longitude AS source_nearest_a3_long,
          SUBSTRING_INDEX(dest.nearest_a1, '@', 1) AS dest_nearest_a1_name, 
          da1.latitude AS dest_nearest_a1_lat, 
          da1.longitude AS dest_nearest_a1_long,
          SUBSTRING_INDEX(dest.nearest_a3, '@', 1) AS dest_nearest_a3_name,
          da3.latitude AS dest_nearest_a3_lat, 
          da3.longitude AS dest_nearest_a3_long
          FROM closer.train_tbl src
          JOIN closer.train_tbl a1 ON a1.city_name = SUBSTRING_INDEX(src.nearest_a1, '@', 1)
          JOIN closer.train_tbl a3 ON a3.city_name = SUBSTRING_INDEX(src.nearest_a3, '@', 1)
          JOIN closer.train_tbl dest ON dest.city_name = ?
          JOIN closer.train_tbl da1 ON da1.city_name = SUBSTRING_INDEX(dest.nearest_a1, '@', 1)
          JOIN closer.train_tbl da3 ON da3.city_name = SUBSTRING_INDEX(dest.nearest_a3, '@', 1)
          WHERE src.city_name = ?;
      `;


    db.query(query, [destinationCity, sourceCity], (err, results) => {
      if (err) {
        console.error('Error querying the database:', err);
        return res.status(500).send('Server error');
      }

      if (results.length > 0) {
        const result = results[0]; 

        const response = {
          sourceCity: {
            city_name: result.source_city,
            latitude: result.source_latitude,
            longitude: result.source_longitude
          },
          destinationCity: {
            city_name: result.destination_city,
            latitude: result.destination_latitude,
            longitude: result.destination_longitude
          }
        };

        // Add nearest station data if applicable
        response.TFTnearestStations = {
          src_nearest_a1: result.source_nearest_a1_name
            ? {
              city_name: result.source_nearest_a1_name,
              latitude: result.source_nearest_a1_lat,
              longitude: result.source_nearest_a1_long
            }
            : null,
          src_nearest_a3: result.source_nearest_a3_name
            ? {
              city_name: result.source_nearest_a3_name,
              latitude: result.source_nearest_a3_lat,
              longitude: result.source_nearest_a3_long
            }
            : null,
          dest_nearest_a1: result.source_nearest_a1_name
            ? {
              city_name: result.dest_nearest_a1_name,
              latitude: result.dest_nearest_a1_lat,
              longitude: result.dest_nearest_a1_long
            }
            : null,
          dest_nearest_a3: result.source_nearest_a3_name
            ? {
              city_name: result.dest_nearest_a3_name,
              latitude: result.dest_nearest_a3_lat,
              longitude: result.dest_nearest_a3_long
            }
            : null
        }

        // Send the response
        console.log(response)
        res.json(response);
        console.log('Coordinates and nearest stations sent successfully');
      } else {
        res.status(404).send('One or both cities not found');
        console.log('One or both cities not found');
      }
    });

  })    
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
