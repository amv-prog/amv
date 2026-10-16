import { Spreadsheet } from './spreadsheet';

export interface BatchUpdateResponse {
  spreadsheetId: string;
  updatedSpreadsheet: Spreadsheet;
}
