import { GridRange } from './grid-range';

export interface MergeCellsRequest {
  range: GridRange;
  mergeType: 'MERGE_ALL' | 'MERGE_COLUMNS' | 'MERGE_ROWS';
}
