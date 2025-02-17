// src/main.ts
import { Navigation } from './components/Navigation';
import { ProtocolTable } from './components/ProtocolTable';

async function init() {
  const app = document.getElementById('app');
  if (!app) return;
  
  const nav = new Navigation();
  const table = new ProtocolTable();
  
  app.appendChild(nav);
  app.appendChild(table);
  
  try {
    const response = await fetch('/api/protocols');
    const protocols = await response.json();
    table.setData(protocols);
  } catch (error) {
    console.error('Fehler beim Laden der Protokolle:', error);
  }
}

init();
