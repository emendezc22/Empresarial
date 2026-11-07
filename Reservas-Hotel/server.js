const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Ajusta usuario/contraseña según tu MySQL (XAMPP: root sin contraseña)
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'hotel',
  dateStrings: true
});

app.get('/', (req, res) => res.redirect('/Rerserva.html'));

// Obtener todas las reservas
app.get('/api/reservas', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM reservas ORDER BY id DESC');
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Guardar una reserva
app.post('/api/reservas', async (req, res) => {
  const { name, email, guests, checkin, checkout, room, message } = req.body;

  if (!name || !email || !guests || !checkin || !checkout || !room) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }
  if (checkout <= checkin) {
    return res.status(400).json({ error: 'La fecha de salida debe ser posterior a la de entrada' });
  }

  try {
    const [r] = await db.query(
      `INSERT INTO reservas (nombre, correo, personas, fecha_entrada, fecha_salida, habitacion, comentarios)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, email, guests, checkin, checkout, room, message]
    );
    res.status(201).json({ id: r.insertId });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(3000, () => console.log('Servidor en http://localhost:3000'));
