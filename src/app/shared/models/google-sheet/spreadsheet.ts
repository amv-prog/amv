import { SpreadsheetProperties } from "./spreadsheet-properties";

export interface Spreadsheet {
    spreadsheetId: string;
    spreadsheetUrl: string;
    properties: SpreadsheetProperties;
}
