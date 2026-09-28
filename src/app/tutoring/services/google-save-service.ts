import { inject, Service } from '@angular/core';
import { GoogleSheetService } from '../../shared/services/google-sheet-service';
import { MessageService } from '../../shared/services/message-service';
import { SaveType } from './save-service';

@Service()
export class GoogleSaveService {
  private readonly googleSheetService = inject(GoogleSheetService);
  private readonly SAVE_SHEET = 'TU_Data';
  private readonly messageService = inject(MessageService);

  saveData(type: SaveType, spreadsheetId: string, data: any) {
    const index = this.getIndex(type);
    this.googleSheetService
      .writeCells(spreadsheetId, this.SAVE_SHEET, `A${index}:B${index}`, [
        [type, JSON.stringify(data)],
      ])
      .subscribe({
        error: (e) => {
          console.error(e);
          this.messageService.displayError(
            "Une erreur s'est produite, les données n'ont pas été mises à jour dans le fichier.",
          );
        },
      });
  }

  private getIndex(type: SaveType): number {
    switch (type) {
      case SaveType.VERSION:
        return 1;
      case SaveType.FAMILIES:
        return 2;
      case SaveType.LESSONS:
        return 3;
      case SaveType.SCHOOLS:
        return 4;
      case SaveType.VOLUNTEERS:
        return 5;
      default:
        return 0;
    }
  }
}
