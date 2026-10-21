import { AutoResizeDimensionsRequest } from './auto-resize-dimensions-request';
import { MergeCellsRequest } from './merge-cells-request';
import { RepeatCellRequest } from './repeat-cell-request';
import { UpdateBordersRequest } from './update-borders-request';

export interface BatchUpdateRequest {
  mergeCells?: MergeCellsRequest;
  repeatCell?: RepeatCellRequest;
  updateBorders?: UpdateBordersRequest;
  autoResizeDimensions?: AutoResizeDimensionsRequest;
}
