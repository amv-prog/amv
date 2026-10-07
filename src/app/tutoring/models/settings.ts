import { GoogleDocInfo } from '../../shared/models/google-doc-info';

export interface Settings {
  saveMode: 'LOCAL_STORAGE' | 'GOOGLESHEET';
  spreadsheet?: GoogleDocInfo;
}
