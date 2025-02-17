// src/components/ProtocolTable.ts
import { Protocol } from '../models/models';

export class ProtocolTable extends HTMLElement {
  private data: Protocol[] = [];
  private shadow: ShadowRoot;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.render();
  }

  setData(protocols: Protocol[]) {
    this.data = protocols;
    this.render();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        .protocol-container {
          margin: 10px 0;
          padding: 10px;
          background: var(--glass-background);
          border-radius: 8px;
        }
        .protocol-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: bold;
          margin-bottom: 5px;
        }
        .sequence-table {
          width: 100%;
          border-collapse: collapse;
        }
        .sequence-table th, .sequence-table td {
          padding: 5px;
          border: 1px solid #ccc;
        }
        .edit-button {
          cursor: pointer;
          background: var(--color-accent);
          color: #fff;
          border: none;
          padding: 5px 10px;
          border-radius: 4px;
          transition: background var(--animation-duration-fast);
        }
        .edit-button:hover {
          background: var(--color-secondary);
        }
      </style>
      <div>
        ${this.data.map(protocol => `
          <div class="protocol-container" data-id="${protocol.id}">
            <div class="protocol-header">
              <div>
                ${protocol.tree} > ${protocol.region} > ${protocol.examEngine} > ${protocol.program} > ${protocol.protocol}
              </div>
              <button class="edit-button" data-id="${protocol.id}">Bearbeiten</button>
            </div>
            <table class="sequence-table">
              <thead>
                <tr>
                  <th>Reihenfolge</th>
                  <th>Sequenz</th>
                </tr>
              </thead>
              <tbody>
                ${protocol.sequences.map(seq => `
                  <tr>
                    <td>${seq.order}</td>
                    <td>${seq.name}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `).join('')}
      </div>
    `;
    this.shadowRoot.querySelectorAll('.edit-button').forEach(button => {
      button.addEventListener('click', (e: Event) => {
        const target = e.target as HTMLElement;
        const protocolId = target.getAttribute('data-id');
        this.dispatchEvent(new CustomEvent('edit-protocol', { detail: { protocolId }, bubbles: true, composed: true }));
      });
    });
  }
}

customElements.define('protocol-table', ProtocolTable);
