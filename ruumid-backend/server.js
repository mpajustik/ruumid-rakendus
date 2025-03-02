require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 5000;

// PostgreSQL ühendus
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Render nõuab seda SSL-ühenduseks
  },
});

// Middleware
app.use(cors());
app.use(express.json()); // Lubab JSON andmeid saata

// Testpäring
app.get("/", (req, res) => {
  res.send("Ruumide backend töötab!");
});

// Testib andmebaasi ühendust
app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Andmebaasi viga" });
  }
});

app.get("/broneeringud", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM broneeringud ORDER BY paev, tund");
    res.json(result.rows);
  } catch (error) {
    console.error("Andmebaasi viga:", error);
    res.status(500).json({ error: "Andmebaasi viga" });
  }
});


app.post("/broneeringud", async (req, res) => {
  const { paev, tund, klass, tunni_nimi, opetaja } = req.body;

  console.log("Saabunud POST andmed:", req.body);

  try {
    const result = await pool.query(
      "INSERT INTO broneeringud (paev, tund, klass, tunni_nimi, opetaja) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [paev, tund, klass, tunni_nimi, opetaja]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("❌ Viga broneeringu lisamisel:", error.message);
    res.status(500).json({ error: error.message });
  }
});




app.put("/broneeringud/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const { paev, tund, klass, tunni_nimi, opetaja } = req.body;

  console.log("🛠 Saabunud PUT päring:", req.body, "ID:", id);

  try {
    const result = await pool.query(
      "UPDATE broneeringud SET paev = $1, tund = $2, klass = $3, tunni_nimi = $4, opetaja = $5 WHERE id = $6 RETURNING *",
      [paev, tund, klass, tunni_nimi, opetaja, id]
    );

    if (result.rows.length === 0) {
      console.error("❌ Broneeringut ei leitud andmebaasist.");
      return res.status(404).json({ error: "Broneeringut ei leitud" });
    }

    console.log("✅ Muudetud broneering:", result.rows[0]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error("❌ Viga broneeringu muutmisel:", error.message);
    res.status(500).json({ error: error.message });
  }
});



app.delete("/broneeringud/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query("DELETE FROM broneeringud WHERE id = $1 RETURNING *", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Broneeringut ei leitud" });
    }

    res.json({ message: "Broneering kustutatud" });
  } catch (error) {
    console.error("Viga broneeringu kustutamisel:", error);
    res.status(500).json({ error: "Andmebaasi viga" });
  }
});


// Serveri käivitamine
app.listen(port, () => {
  console.log(`Server töötab pordil ${port}`);
});