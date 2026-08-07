import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { GridHeatmapService } from '../../services/grid-heatmap.service';

export interface HeatmapSettingsDialogData {
  columns: string[];
  heatmapService: GridHeatmapService;
  sampleData: any; // First row to infer data type
}

@Component({
  selector: 'app-heatmap-settings-dialog',
  imports: [
    CommonModule, 
    MatDialogModule, 
    MatButtonModule, 
    MatIconModule, 
    MatSlideToggleModule,
    MatSelectModule,
    MatFormFieldModule,
    FormsModule
  ],
  templateUrl: './heatmap-settings-dialog.html',
  styleUrl: './heatmap-settings-dialog.scss'
})
export class HeatmapSettingsDialog {
  dialogRef = inject(MatDialogRef<HeatmapSettingsDialog>);
  data = inject<HeatmapSettingsDialogData>(MAT_DIALOG_DATA);
  heatmapService = this.data.heatmapService;

  inferDataType(colName: string): 'number' | 'date' {
    const val = this.data.sampleData?.[colName];
    if (val && typeof val === 'string' && val.includes('-') && !isNaN(Date.parse(val))) {
      return 'date';
    }
    return 'number';
  }

  toggleColumn(colName: string) {
    this.heatmapService.toggleConfig(colName, this.inferDataType(colName));
  }

  getConfig(colName: string) {
    return this.heatmapService.configs().get(colName) || null;
  }

  updateConfig(colName: string, updates: Partial<any>) {
    const config = this.getConfig(colName);
    if (config) {
      this.heatmapService.setConfig(colName, { ...config, ...updates });
    }
  }
}
