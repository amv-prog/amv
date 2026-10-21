import { Border } from './border';
import { GridRange } from './grid-range';

export interface UpdateBordersRequest {
  range: GridRange;
  top: Border;
  bottom: Border;
  left: Border;
  right: Border;
  innerHorizontal: Border;
  innerVertical: Border;
}
