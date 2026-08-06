import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FileParserService } from '@shared/services/file-parser';
import { DataGridComponent } from '@shared/components/data-grid/data-grid';

@Component({
  selector: 'app-view-tables',
  imports: [CommonModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, DataGridComponent],
  templateUrl: './view-tables.html',
  styleUrl: './view-tables.css',
})
export class ViewTables {
  private fileParser = inject(FileParserService);

  columns = signal<string[]>([]);
  tableData = signal<any[]>([]);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  fileName = signal<string | null>(null);

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];
    this.fileName.set(file.name);
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const parsed = await this.fileParser.parseFile(file);
      this.columns.set(parsed.columns);
      this.tableData.set(parsed.data);
    } catch (error) {
      console.error('Error parsing file:', error);
      this.errorMessage.set('Hubo un error al leer el archivo. Asegúrate de que sea un Excel o CSV válido.');
      this.columns.set([]);
      this.tableData.set([]);
    } finally {
      this.isLoading.set(false);
      // Reset input para permitir cargar el mismo archivo de nuevo si se desea
      input.value = '';
    }
  }

  clearData() {
    this.columns.set([]);
    this.tableData.set([]);
    this.fileName.set(null);
    this.errorMessage.set(null);
  }
}
