// src/components/Navigation.ts
export class Navigation extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.render();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        .navigation {
          width: 100%;
          padding: 10px;
          background: var(--glass-background);
        }
        #search {
          width: 100%;
          padding: 5px;
          margin-bottom: 10px;
          border: 1px solid #ccc;
          border-radius: 4px;
        }
        .nav-item {
          padding: 5px;
          cursor: pointer;
          transition: background var(--animation-duration-fast);
        }
        .nav-item:hover {
          background: var(--color-accent);
        }
      </style>
      <div class="navigation">
        <input type="text" id="search" placeholder="Suche..." />
        <div id="nav-items">
          <div class="nav-item" data-type="tree">PRISMA FLEET</div>
        </div>
      </div>
    `;
    const searchInput = this.shadowRoot.getElementById('search');
    searchInput?.addEventListener('input', (e: Event) => {
      const target = e.target as HTMLInputElement;
      const searchTerm = target.value;
      console.log('Sucheingabe:', searchTerm);
    });
  }
}

customElements.define('app-navigation', Navigation);
