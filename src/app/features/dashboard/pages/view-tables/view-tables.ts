import { Component, signal, computed, inject, ViewChild, TemplateRef, ViewContainerRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PortalModule, TemplatePortal } from '@angular/cdk/portal';
import { FileParserService } from '@shared/services/file-parser';
import { DataGridComponent } from '@shared/components/data-grid/data-grid';
import { GridHeatmapService } from '@shared/services/grid-heatmap.service';
import { HeatmapSettingsDialog } from '@shared/components/heatmap-settings-dialog/heatmap-settings-dialog';
import { FileApiService } from '@shared/services/file-api.service';
import { GridFilterService } from '@shared/services/grid-filter.service';
import { GridFiltersComponent } from '@shared/components/grid-filters/grid-filters';
import { GlobalSidenavService } from '@shared/services/global-sidenav.service';
import { ApiColumnMetadata } from '@shared/models/api.models';
import { GridReportService } from '@shared/services/grid-report.service';

@Component({
  selector: 'app-view-tables',
  imports: [
    CommonModule, 
    MatButtonModule, 
    MatIconModule, 
    MatProgressSpinnerModule, 
    MatDialogModule, 
    MatTooltipModule,
    MatSidenavModule,
    PortalModule,
    DataGridComponent,
    GridFiltersComponent
  ],
  providers: [GridHeatmapService, GridReportService],
  templateUrl: './view-tables.html',
  styleUrl: './view-tables.css',
})
export class ViewTables implements AfterViewInit, OnDestroy {
  private fileParser = inject(FileParserService);
  private heatmapService = inject(GridHeatmapService);
  private fileApi = inject(FileApiService);
  private filterService = inject(GridFilterService);
  private dialog = inject(MatDialog);
  public globalSidenav = inject(GlobalSidenavService);
  private viewContainerRef = inject(ViewContainerRef);
  private reportService = inject(GridReportService);

  @ViewChild('sidenav') sidenav!: MatSidenav;
  @ViewChild('filtersPortalTemplate') filtersPortalTemplate!: TemplateRef<any>;
  @ViewChild(DataGridComponent) dataGrid!: DataGridComponent;

  ngAfterViewInit() {
    if (this.filtersPortalTemplate) {
      const portal = new TemplatePortal(this.filtersPortalTemplate, this.viewContainerRef);
      this.globalSidenav.setContent(portal);
    }
  }

  ngOnDestroy() {
    this.globalSidenav.clearContent();
  }

  columns = signal<string[]>([]);
  tableData = signal<any[]>([]);
  apiMetadata = signal<ApiColumnMetadata[]>([]);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  fileName = signal<string | null>(null);

  filteredData = computed(() => {
    return this.filterService.applyFilters(this.tableData(), this.apiMetadata());
  });

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
      // Procesar localmente (muy rápido gracias al Web Worker)
      const parsed = await this.fileParser.parseFile(file);
      
      this.columns.set(parsed.columns);
      this.tableData.set(parsed.data);
      this.heatmapService.data.set(parsed.data);
      this.isLoading.set(false); // Quitar el loading local de inmediato

      // Subir a la API en segundo plano sin bloquear la UI
      this.fileApi.uploadFile(file).subscribe({
        next: (apiResponse) => {
          if (apiResponse.success) {
            this.apiMetadata.set(apiResponse.data.columns);
          }
        },
        error: (err) => console.error('Error al subir a la API', err)
      });

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
    this.apiMetadata.set([]);
    this.filterService.clearFilters();
    this.heatmapService.data.set([]);
    this.heatmapService.configs.set(new Map());
    this.fileName.set(null);
    this.errorMessage.set(null);
  }

  openHeatmapSettings() {
    if (this.columns().length === 0) return;
    this.dialog.open(HeatmapSettingsDialog, {
      width: '600px',
      data: {
        columns: this.columns(),
        heatmapService: this.heatmapService,
        sampleData: this.tableData()[0]
      }
    });
  }

  generateReport() {
    if (!this.dataGrid) return;
    const hidden = Array.from(this.dataGrid.hiddenColumns());
    const sortCol = this.dataGrid.sortColumn();
    const sortDir = this.dataGrid.sortDirection();
    
    const report = this.reportService.generateReport(
      this.columns(),
      hidden,
      sortCol,
      sortDir
    );

    console.log("Reporte Generado:", report);
    alert("Reporte generado con éxito. Revisa la consola para más detalles.\n\n" + JSON.stringify(report, null, 2));
  }
}
