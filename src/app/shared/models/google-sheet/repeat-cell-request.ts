import { CellData } from './cell-data';
import { GridRange } from './grid-range';

export interface RepeatCellRequest {
  range: GridRange;
  cell: CellData;
  fields: string;
}
