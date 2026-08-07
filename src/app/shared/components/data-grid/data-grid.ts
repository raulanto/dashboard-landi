import { Component, input, computed, inject, NgZone, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { GridSelectionService } from '../../services/grid-selection.service';
import { GridHeatmapService } from '../../services/grid-heatmap.service';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-data-grid',
  imports: [CommonModule, ScrollingModule, MatMenuModule, MatButtonModule, MatIconModule, MatCheckboxModule],
  providers: [GridSelectionService],
  host: {
    // Eventos globales movidos a ngZone para evitar Change Detection infinito
  },
  template: `
    <div style="margin-bottom: 8px; display: flex; justify-content: flex-end;">
      <button mat-button [matMenuTriggerFor]="columnMenu" color="primary">
        <mat-icon>view_column</mat-icon> Columnas
      </button>
      <mat-menu #columnMenu="matMenu">
        <div class="p-0" (click)="$event.stopPropagation()">
          @for (col of columns(); track col) {
            <mat-checkbox 
              [checked]="isColumnVisible(col)"
              (change)="toggleColumn(col)">
              {{ col }}
            </mat-checkbox>
            <br>
          }
        </div>
      </mat-menu>
    </div>

    <div class="grid-container" (keydown)="onKeyDown($event)" tabindex="0" role="grid">
      <div class="grid-scroll-wrapper">
        <!-- Headers -->
        <div class="grid-header" [style.grid-template-columns]="gridColumns()">
          <div class="grid-header-cell index-header" role="columnheader">#</div>
          @for (col of displayedColumns(); track col) {
            <div class="grid-header-cell" role="columnheader" 
                 style="cursor: pointer; display: flex; align-items: center; justify-content: space-between;"
                 (click)="sortBy(col)">
              {{ col }}
              @if (sortColumn() === col) {
                <mat-icon style="font-size: 16px; width: 16px; height: 16px;">
                  {{ sortDirection() === 'asc' ? 'arrow_upward' : 'arrow_downward' }}
                </mat-icon>
              }
            </div>
          }
        </div>

        <!-- Virtual Scroll Viewport for Data Rows -->
        <cdk-virtual-scroll-viewport itemSize="36" class="viewport">
        <div *cdkVirtualFor="let row of sortedData(); let rowIndex = index" class="grid-row" [style.grid-template-columns]="gridColumns()">
          <div class="grid-cell index-cell" 
               (mousedown)="startRowDrag(rowIndex, $event)"
               (mouseenter)="onRowMouseEnter(rowIndex)"
               role="gridcell">
            {{ rowIndex + 1 }}
          </div>
          @for (col of displayedColumns(); track col; let colIndex = $index) {
            <div 
              class="grid-cell"
              [class.selected]="selectionService.isSelected(rowIndex, colIndex)"
              [class.active]="selectionService.isActive(rowIndex, colIndex)"
              [class.has-heatmap]="heatmapService.getColor(col, row[col]) !== ''"
              [style.--heatmap-bg]="heatmapService.getColor(col, row[col])"
              (mousedown)="onMouseDown(rowIndex, colIndex, $event)"
              (mouseenter)="onMouseEnter(rowIndex, colIndex)"
              [title]="row[col]"
              role="gridcell">
              {{ row[col] }}
            </div>
          }
        </div>
      </cdk-virtual-scroll-viewport>
      </div>
    </div>
  `,
  styleUrls: ['./data-grid.scss']
})
export class DataGridComponent {
  columns = input.required<string[]>();
  data = input.required<any[]>();
  
  selectionService = inject(GridSelectionService);
  heatmapService = inject(GridHeatmapService);
  private ngZone = inject(NgZone);

  hiddenColumns = signal<Set<string>>(new Set());
  sortColumn = signal<string | null>(null);
  sortDirection = signal<'asc' | 'desc'>('asc');

  displayedColumns = computed(() => {
    const hidden = this.hiddenColumns();
    return this.columns().filter(col => !hidden.has(col));
  });

  sortedData = computed(() => {
    const col = this.sortColumn();
    const dir = this.sortDirection();
    const dataCopy = [...this.data()];
    
    if (!col) return dataCopy;

    return dataCopy.sort((a, b) => {
      const valA = a[col];
      const valB = b[col];
      
      // Basic sorting logic handling numbers and strings
      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return dir === 'asc' ? -1 : 1;
      if (valB === null || valB === undefined) return dir === 'asc' ? 1 : -1;

      const numA = Number(valA);
      const numB = Number(valB);

      if (!isNaN(numA) && !isNaN(numB)) {
        return dir === 'asc' ? numA - numB : numB - numA;
      }

      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();
      
      if (strA < strB) return dir === 'asc' ? -1 : 1;
      if (strA > strB) return dir === 'asc' ? 1 : -1;
      return 0;
    });
  });

  private boundMouseMove = this.onWindowMouseMove.bind(this);
  private boundMouseUp = this.onMouseUp.bind(this);

  ngOnInit() {
    this.ngZone.runOutsideAngular(() => {
      window.addEventListener('mousemove', this.boundMouseMove);
      window.addEventListener('mouseup', this.boundMouseUp);
    });
  }

  ngOnDestroy() {
    window.removeEventListener('mousemove', this.boundMouseMove);
    window.removeEventListener('mouseup', this.boundMouseUp);
  }

  gridColumns = computed(() => {
    return `60px repeat(${this.displayedColumns().length}, 180px)`;
  });

  isColumnVisible(col: string): boolean {
    return !this.hiddenColumns().has(col);
  }

  toggleColumn(col: string) {
    const hidden = new Set(this.hiddenColumns());
    if (hidden.has(col)) {
      hidden.delete(col);
    } else {
      hidden.add(col);
    }
    this.hiddenColumns.set(hidden);
  }

  sortBy(col: string) {
    if (this.sortColumn() === col) {
      if (this.sortDirection() === 'asc') {
        this.sortDirection.set('desc');
      } else {
        this.sortColumn.set(null);
        this.sortDirection.set('asc');
      }
    } else {
      this.sortColumn.set(col);
      this.sortDirection.set('asc');
    }
  }

  onMouseDown(rowIndex: number, colIndex: number, event: MouseEvent) {
    if (event.shiftKey) {
      this.selectionService.isDragging.set(true);
      this.selectionService.updateDrag(rowIndex, colIndex, this.displayedColumns().length);
      this.selectionService.isDragging.set(false);
    } else {
      this.selectionService.startDrag(rowIndex, colIndex);
    }
    event.preventDefault();
  }

  onMouseEnter(rowIndex: number, colIndex: number) {
    this.selectionService.updateDrag(rowIndex, colIndex, this.displayedColumns().length);
  }

  onMouseUp() {
    this.selectionService.endDrag();
    if (this.dragScrollAnimationFrame) {
      cancelAnimationFrame(this.dragScrollAnimationFrame);
      this.dragScrollAnimationFrame = null;
    }
  }

  startRowDrag(rowIndex: number, event: MouseEvent) {
    if (event.shiftKey) {
      this.selectionService.isRowSelectionMode.set(true);
      this.selectionService.isDragging.set(true);
      this.selectionService.updateDrag(rowIndex, 0, this.displayedColumns().length);
      this.selectionService.isDragging.set(false);
      this.selectionService.isRowSelectionMode.set(false);
    } else {
      this.selectionService.startRowDrag(rowIndex, this.displayedColumns().length);
    }
    event.preventDefault();
  }

  onRowMouseEnter(rowIndex: number) {
    if (this.selectionService.isRowSelectionMode()) {
       this.selectionService.updateDrag(rowIndex, 0, this.displayedColumns().length);
    }
  }

  private dragScrollAnimationFrame: number | null = null;
  private currentMouseX = 0;
  private currentMouseY = 0;
  private scrollContainer: HTMLElement | null = null;
  private viewportContainer: HTMLElement | null = null;

  onWindowMouseMove(event: MouseEvent) {
    if (this.selectionService.isDragging()) {
      this.currentMouseX = event.clientX;
      this.currentMouseY = event.clientY;
      if (!this.dragScrollAnimationFrame) {
        this.dragScrollAnimationFrame = requestAnimationFrame(() => this.autoScroll());
      }
    }
  }

  autoScroll() {
    if (!this.selectionService.isDragging()) {
      this.dragScrollAnimationFrame = null;
      return;
    }

    if (!this.scrollContainer) {
      this.scrollContainer = document.querySelector('.grid-container') as HTMLElement;
      this.viewportContainer = document.querySelector('.viewport') as HTMLElement;
    }

    if (this.scrollContainer && this.viewportContainer) {
      const rect = this.scrollContainer.getBoundingClientRect();
      const edgeSize = 50; 
      let dx = 0;
      let dy = 0;

      if (this.currentMouseX < rect.left + edgeSize) dx = -20;
      else if (this.currentMouseX > rect.right - edgeSize) dx = 20;

      if (this.currentMouseY < rect.top + edgeSize) dy = -20;
      else if (this.currentMouseY > rect.bottom - edgeSize) dy = 20;

      if (dx !== 0) this.scrollContainer.scrollBy(dx, 0);
      if (dy !== 0) this.viewportContainer.scrollBy(0, dy);
    }

    this.dragScrollAnimationFrame = requestAnimationFrame(() => this.autoScroll());
  }

  onKeyDown(event: KeyboardEvent) {
    const maxRow = this.data().length - 1;
    const maxCol = this.displayedColumns().length - 1;
    
    switch (event.key) {
      case 'ArrowUp':
        this.selectionService.navigate('UP', maxRow, maxCol, event.shiftKey);
        event.preventDefault();
        break;
      case 'ArrowDown':
        this.selectionService.navigate('DOWN', maxRow, maxCol, event.shiftKey);
        event.preventDefault();
        break;
      case 'ArrowLeft':
        this.selectionService.navigate('LEFT', maxRow, maxCol, event.shiftKey);
        event.preventDefault();
        break;
      case 'ArrowRight':
        this.selectionService.navigate('RIGHT', maxRow, maxCol, event.shiftKey);
        event.preventDefault();
        break;
      case 'Escape':
        this.selectionService.clearSelection();
        break;
    }
  }
}
