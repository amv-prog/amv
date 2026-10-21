import { Dimension } from './dimension';

export interface DimensionRange {
  sheetId: number;
  dimension: Dimension;
  startIndex?: number;
  endIndex?: number;
}
