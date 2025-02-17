// src/components/DragDrop.ts
export class DragDrop {
  private container: HTMLElement;
  private draggedElement: HTMLElement | null = null;

  constructor(container: HTMLElement) {
    this.container = container;
    this.init();
  }

  private init() {
    this.container.addEventListener('dragstart', this.onDragStart.bind(this));
    this.container.addEventListener('dragover', this.onDragOver.bind(this));
    this.container.addEventListener('drop', this.onDrop.bind(this));
    const items = this.container.querySelectorAll('.sequence-row');
    items.forEach(item => {
      (item as HTMLElement).setAttribute('draggable', 'true');
    });
  }

  private onDragStart(e: DragEvent) {
    const target = e.target as HTMLElement;
    if (target && target.classList.contains('sequence-row')) {
      this.draggedElement = target;
      e.dataTransfer?.setData('text/plain', '');
      target.classList.add('dragging');
    }
  }

  private onDragOver(e: DragEvent) {
    e.preventDefault();
    const target = e.target as HTMLElement;
    if (target && target !== this.draggedElement && target.closest('.sequence-row')) {
      target.classList.add('drag-over');
    }
  }

  private onDrop(e: DragEvent) {
    e.preventDefault();
    const target = e.target as HTMLElement;
    if (target && this.draggedElement && target.closest('.sequence-row')) {
      const dropTarget = target.closest('.sequence-row') as HTMLElement;
      if (dropTarget && dropTarget !== this.draggedElement) {
        this.container.insertBefore(this.draggedElement, dropTarget.nextSibling);
        this.updateOrder();
      }
    }
    this.clearDragStyles();
  }

  private updateOrder() {
    const rows = Array.from(this.container.querySelectorAll('.sequence-row'));
    rows.forEach((row, index) => {
      const orderCell = row.querySelector('td');
      if (orderCell) {
        orderCell.textContent = (index + 1).toString();
      }
    });
  }

  private clearDragStyles() {
    this.container.querySelectorAll('.dragging').forEach(el => el.classList.remove('dragging'));
    this.container.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
    this.draggedElement = null;
  }
}
