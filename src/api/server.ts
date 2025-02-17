// src/api/server.ts
import express from 'express';
import bodyParser from 'body-parser';
import { initializeDatabase } from './db';
import path from 'path';

const app = express();
app.use(bodyParser.json());

let db: any;
initializeDatabase()
  .then(database => {
    db = database;
    console.log('Database initialized');
  })
  .catch(err => {
    console.error('Database initialization failed:', err);
  });

/*
  GET /api/protocols
  - Lädt alle Protokolle inkl. sortierter Sequenzlisten.
*/
app.get('/api/protocols', async (req, res) => {
  try {
    const protocols = await db.all('SELECT * FROM protocols');
    for (const protocol of protocols) {
      const sequences = await db.all(
        'SELECT * FROM sequences WHERE protocol_id = ? ORDER BY sequence_order',
        protocol.id
      );
      protocol.sequences = sequences;
    }
    res.json(protocols);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/*
  PUT /api/protocols/:id
  - Aktualisiert ein Protokoll inkl. kompletter Sequenzliste.
*/
app.put('/api/protocols/:id', async (req, res) => {
  try {
    const { tree, region, examEngine, program, protocol, sequences } = req.body;
    const id = req.params.id;
    await db.run(
      'UPDATE protocols SET tree = ?, region = ?, examEngine = ?, program = ?, protocol = ? WHERE id = ?',
      [tree, region, examEngine, program, protocol, id]
    );
    await db.run('DELETE FROM sequences WHERE protocol_id = ?', id);
    let order = 1;
    for (const seq of sequences) {
      await db.run(
        'INSERT INTO sequences (protocol_id, sequence_order, sequence) VALUES (?, ?, ?)',
        [id, order, seq]
      );
      order++;
    }
    res.json({ message: 'Protocol updated' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/*
  DELETE /api/protocols/:id
  - Löscht ein Protokoll (FK-Constraint löscht auch die zugehörigen Sequenzen).
*/
app.delete('/api/protocols/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await db.run('DELETE FROM protocols WHERE id = ?', id);
    res.json({ message: 'Protocol deleted' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/*
  Statische Dateien ausliefern:
  - Dient dazu, die gebaute Frontend-Anwendung (im Verzeichnis dist) bereitzustellen.
*/
const distPath = path.join(__dirname, '../../dist');
app.use(express.static(distPath));
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
