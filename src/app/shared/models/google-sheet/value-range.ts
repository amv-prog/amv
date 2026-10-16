import { Dimension } from './dimension';

export interface ValueRange {
  range?: string;
  majorDimension?: Dimension;
  values?: string[][];
}
