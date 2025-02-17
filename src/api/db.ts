// src/api/db.ts
import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(__dirname, '../../protocols.db');
const JSON_PATH = path.join(__dirname, '../../protocols.json');

/*
  - Initialisiert die Datenbank.
  - Erstellt Tabellen, falls die Datenbank nicht existiert.
  - Importiert Daten aus protocols.json bei der ersten Ausführung.
*/
export async function initializeDatabase(): Promise<Database> {
  const dbExists = fs.existsSync(DB_PATH);
  const db = await open({
    filename: DB_PATH,
    driver: sqlite3.Database
  });
  
  if (!dbExists) {
    await db.exec(`
      CREATE TABLE protocols (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tree TEXT NOT NULL,
        region TEXT NOT NULL,
        examEngine TEXT NOT NULL,
        program TEXT NOT NULL,
        protocol TEXT NOT NULL
      );
      CREATE TABLE sequences (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        protocol_id INTEGER NOT NULL,
        sequence_order INTEGER NOT NULL,
        sequence TEXT NOT NULL,
        FOREIGN KEY(protocol_id) REFERENCES protocols(id)
      );
    `);
    
    const data = fs.readFileSync(JSON_PATH, 'utf-8');
    const protocols = JSON.parse(data);
    for (const record of protocols) {
      const { tree, region, examEngine, program, protocol, sequenceArray } = record;
      const result = await db.run(
        'INSERT INTO protocols (tree, region, examEngine, program, protocol) VALUES (?, ?, ?, ?, ?)',
        [tree, region, examEngine, program, protocol]
      );
      const protocolId = result.lastID;
      let order = 1;
      for (const seq of sequenceArray) {
        await db.run(
          'INSERT INTO sequences (protocol_id, sequence_order, sequence) VALUES (?, ?, ?)',
          [protocolId, order, seq]
        );
        order++;
      }
    }
  }
  return db;
}
