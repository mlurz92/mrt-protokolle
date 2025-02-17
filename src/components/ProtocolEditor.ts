// src/components/ProtocolEditor.ts
import { Protocol, Sequence } from '../models/models';
import { DragDrop } from './DragDrop';

export class ProtocolEditor extends HTMLElement {
  private protocol: Protocol | null = null;
  private shadow: ShadowRoot;
  private container: HTMLElement;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.render();
    this.container = this.shadowRoot.querySelector('.editor-container') as HTMLElement;
  }

  open(protocol: Protocol) {
    this.protocol = protocol;
    this.render();
    this.shadowRoot.querySelector('.editor-overlay')?.classList.add('open');
  }

  close() {
    this.shadowRoot.querySelector('.editor-overlay')?.classList.remove('open');
  }

  getUpdatedProtocol(): Protocol | null {
    if (!this.protocol) return null;
    const rows = Array.from(this.shadowRoot.querySelectorAll('.sequence-row'));
    const updatedSequences: Sequence[] = rows.map((row, index) => {
      const seqInput = row.querySelector('.seq-input') as HTMLInputElement;
      return {
        id: '',
        protocolId: this.protocol!.id,
        name: seqInput.value,
        order: index + 1,
        createdAt: '',
        updatedAt: ''
      };
    });
    return { ...this.protocol, sequences: updatedSequences };
  }

  render() {
    const sequences = this.protocol ? this.protocol.sequences : [];
    this.shadowRoot.innerHTML = `
      <style>
        .editor-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.8);
          display: flex;
          justify-content: center;
          align-items: center;
          opacity: 0;
          visibility: hidden;
          transition: opacity var(--animation-duration-normal) var(--animation-easing);
        }
        .editor-overlay.open {
          opacity: 1;
          visibility: visible;
        }
        .editor-container {
          background: var(--glass-background);
          padding: 20px;
          border-radius: 8px;
          max-width: 600px;
          width: 90%;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th, td {
          padding: 8px;
          border: 1px solid #ccc;
        }
        .button-container {
          margin-top: 10px;
          text-align: right;
        }
        .editor-button {
          padding: 8px 12px;
          margin-left: 5px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: background var(--animation-duration-fast);
        }
        .save-button {
          background: var(--color-accent);
          color: #fff;
        }
        .cancel-button {
          background: #ccc;
          color: #000;
        }
      </style>
      <div class="editor-overlay">
        <div class="editor-container">
          <h3>Protokoll bearbeiten</h3>
          <table>
            <thead>
              <tr>
                <th>Reihenfolge</th>
                <th>Sequenz</th>
              </tr>
            </thead>
            <tbody id="sequence-list">
              ${sequences.map(seq => `
                <tr class="sequence-row">
                  <td>${seq.order}</td>
                  <td><input class="seq-input" type="text" value="${seq.name}" /></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="button-container">
            <button class="editor-button save-button">Speichern</button>
            <button class="editor-button cancel-button">Abbrechen</button>
          </div>
        </div>
      </div>
    `;
    this.shadowRoot.querySelector('.save-button')?.addEventListener('click', () => {
      const updated = this.getUpdatedProtocol();
      if (updated) {
        this.dispatchEvent(new CustomEvent('save-protocol', { detail: { protocol: updated }, bubbles: true, composed: true }));
      }
      this.close();
    });
    this.shadowRoot.querySelector('.cancel-button')?.addEventListener('click', () => {
      this.dispatchEvent(new Event('cancel-edit', { bubbles: true, composed: true }));
      this.close();
    });
    const sequenceList = this.shadowRoot.getElementById('sequence-list');
    if (sequenceList) {
      new DragDrop(sequenceList);
    }
  }
}

customElements.define('protocol-editor', ProtocolEditor);
