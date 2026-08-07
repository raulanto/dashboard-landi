export interface HeatmapConfig {
  enabled: boolean;
  direction: 'asc' | 'desc';
  dataType: 'number' | 'date';
}

export interface ColumnStats {
  min: number;
  max: number;
}
