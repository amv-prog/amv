import { BatchUpdateReply } from './batch-update-reply';
import { Spreadsheet } from './spreadsheet';

export interface BatchUpdateResponse {
  spreadsheetId: string;
  replies: BatchUpdateReply[];
  updatedSpreadsheet: Spreadsheet;
}
