import { inject, Service } from '@angular/core';
import { combineLatest, map, Observable, of, switchMap, throwError } from 'rxjs';
import { Address } from '../../shared/models/address';
import { BatchUpdateRequest } from '../../shared/models/google-sheet/batch-update-request';
import { Border } from '../../shared/models/google-sheet/border';
import { Dimension } from '../../shared/models/google-sheet/dimension';
import { GridRange } from '../../shared/models/google-sheet/grid-range';
import { UpdateValuesResponse } from '../../shared/models/google-sheet/update-values-response';
import { DateService } from '../../shared/services/date-service';
import { GoogleSheetService } from '../../shared/services/google-sheet-service';
import { VolunteerMember } from '../models/volunteer-member';
import { SettingsStore } from '../stores/settings-store';
import { VolunteerStore } from '../stores/volunteer-store';

@Service()
export class VolunteerService {
  private readonly cellBuffer = '     ';
  private readonly volunteerStore = inject(VolunteerStore);
  private readonly googleSheetService = inject(GoogleSheetService);
  private readonly settingStore = inject(SettingsStore);
  private readonly dateService = inject(DateService);

  addVolunteerSheet$(sheetName: string, title?: string): Observable<boolean> {
    const spreadsheetId = this.settingStore.settings().spreadsheetId;
    if (!spreadsheetId) {
      throw new Error('Création impossible, pas de fichier saisi');
    }

    const volunteers = this.volunteerStore.volunteers();

    return this.googleSheetService.addSheet$(spreadsheetId, sheetName).pipe(
      switchMap((response) => {
        // On insère les données
        return this.updateVolunteerSheetData$(spreadsheetId, sheetName, volunteers).pipe(
          map(() => response),
        );
      }),
      switchMap((response) => {
        // On met à jour le style de la page
        const sheetId = response.replies.find((r) => !!r.addSheet)?.addSheet?.properties.sheetId;
        if (sheetId === undefined) {
          throwError(() => {
            return new Error("Impossible de retrouver l'id de la feuille");
          });
        }
        return this.updateVolunteerSheetFormat$(spreadsheetId, sheetId!, volunteers.length);
      }),
      switchMap((sheetId) => {
        // On ajoute le titre
        if (!!title) {
          return this.addTitle$(spreadsheetId, sheetId, sheetName, title);
        } else {
          return of(true);
        }
      }),
      map(() => true),
    );
  }

  private volunteerHeader(): string[] {
    return [
      'Nom' + this.cellBuffer,
      'Prénom' + this.cellBuffer,
      'Adresse' + this.cellBuffer,
      "Complément d'adresse" + this.cellBuffer,
      'CP - Ville' + this.cellBuffer,
      'Mail' + this.cellBuffer,
      'Téléphone' + this.cellBuffer,
    ];
  }

  private volunteersData(volunteers: VolunteerMember[]): string[][] {
    return volunteers.map((v) => this.volunteerData(v));
  }

  private volunteerData(volunteer: VolunteerMember): string[] {
    const data: string[] = [];
    // On ajoute un buffer car l'autoresize fait les colonnes légèrement trop petites
    data.push(volunteer.lastName + this.cellBuffer);
    data.push(volunteer.firstName + this.cellBuffer);
    data.push((volunteer.address?.street || '') + this.cellBuffer);
    data.push((volunteer.address?.additional || '') + this.cellBuffer);
    data.push(this.addressCodeCity(volunteer.address) + this.cellBuffer);
    data.push((volunteer.email || '') + this.cellBuffer);
    data.push(volunteer.phoneNumbers.join(', ') + this.cellBuffer);
    return data;
  }

  private addressCodeCity(address: Address | undefined): string {
    return [address?.postCode, address?.city].filter((data) => !!data).join(' - ');
  }

  private updateVolunteerSheetData$(
    spreadsheetId: string,
    sheetName: string,
    volunteers: VolunteerMember[],
  ): Observable<boolean> {
    const requests$: Observable<UpdateValuesResponse>[] = [];

    const date = this.dateService.formatDate(new Date(), 'yyyy-MM-dd h:mm:ss') || '';
    requests$.push(
      this.googleSheetService.writeCell(spreadsheetId, sheetName, 'G1', date + this.cellBuffer),
    );

    requests$.push(
      this.googleSheetService.writeCell(
        spreadsheetId,
        sheetName,
        'A6',
        'BÉNÉVOLES' + this.cellBuffer,
      ),
    );

    const values = [this.volunteerHeader(), ...this.volunteersData(volunteers)];
    requests$.push(this.googleSheetService.writeCells(spreadsheetId, sheetName, 'A7', values));

    return combineLatest(requests$).pipe(map(() => true));
  }

  private updateVolunteerSheetFormat$(
    spreadsheetId: string,
    sheetId: number,
    nbVolunteers: number,
  ): Observable<number> {
    const centerVerticalRequest: BatchUpdateRequest = {
      repeatCell: {
        range: {
          sheetId,
        },
        cell: {
          userEnteredFormat: {
            verticalAlignment: 'MIDDLE',
          },
        },
        fields: 'userEnteredFormat.verticalAlignment',
      },
    };

    const centerDateRequest: BatchUpdateRequest = {
      repeatCell: {
        range: {
          sheetId,
          startRowIndex: 0,
          endRowIndex: 1,
          startColumnIndex: 6,
          endColumnIndex: 7,
        },
        cell: {
          userEnteredFormat: {
            horizontalAlignment: 'RIGHT',
          },
        },
        fields: 'userEnteredFormat.horizontalAlignment',
      },
    };

    const borderMediumStyle: Border = {
      style: 'SOLID_MEDIUM',
    };
    const borderSolidStyle: Border = {
      style: 'SOLID',
    };
    const headerRange: GridRange = {
      sheetId,
      startRowIndex: 6,
      endRowIndex: 7,
      startColumnIndex: 0,
      endColumnIndex: 7,
    };
    const headerBorderRequest: BatchUpdateRequest = {
      updateBorders: {
        range: headerRange,
        top: borderMediumStyle,
        bottom: borderMediumStyle,
        left: borderMediumStyle,
        right: borderMediumStyle,
        innerHorizontal: borderMediumStyle,
        innerVertical: borderSolidStyle,
      },
    };
    const tableBorderRequest: BatchUpdateRequest = {
      updateBorders: {
        range: {
          sheetId,
          startRowIndex: 7,
          endRowIndex: 7 + nbVolunteers,
          startColumnIndex: 0,
          endColumnIndex: 7,
        },
        top: borderMediumStyle,
        bottom: borderMediumStyle,
        left: borderMediumStyle,
        right: borderMediumStyle,
        innerHorizontal: borderSolidStyle,
        innerVertical: borderSolidStyle,
      },
    };

    const centerheaderRequest: BatchUpdateRequest = {
      repeatCell: {
        range: headerRange,
        cell: {
          userEnteredFormat: {
            horizontalAlignment: 'CENTER',
          },
        },
        fields: 'userEnteredFormat.horizontalAlignment',
      },
    };

    const resizeColRequest: BatchUpdateRequest = {
      autoResizeDimensions: {
        dimensions: {
          sheetId,
          dimension: Dimension.COLUMNS,
          startIndex: 0,
          endIndex: 7,
        },
      },
    };

    const warpRequest: BatchUpdateRequest = {
      repeatCell: {
        range: {
          sheetId,
          startRowIndex: 0,
          endRowIndex: 7 + nbVolunteers,
          startColumnIndex: 0,
          endColumnIndex: 7,
        },
        cell: {
          userEnteredFormat: {
            wrapStrategy: 'WRAP',
          },
        },
        fields: 'userEnteredFormat.wrapStrategy',
      },
    };

    const boldRequest: BatchUpdateRequest = {
      repeatCell: {
        range: {
          sheetId,
          startRowIndex: 5,
          endRowIndex: 6,
          startColumnIndex: 0,
          endColumnIndex: 1,
        },
        cell: {
          userEnteredFormat: {
            textFormat: {
              bold: true,
            },
          },
        },
        fields: 'userEnteredFormat.textFormat',
      },
    };

    return this.googleSheetService
      .batchUpdate$(spreadsheetId, [
        centerVerticalRequest,
        centerDateRequest,
        headerBorderRequest,
        centerheaderRequest,
        tableBorderRequest,
        resizeColRequest,
        warpRequest,
        boldRequest,
      ])
      .pipe(map(() => sheetId));
  }

  private addTitle$(
    spreadsheetId: string,
    sheetId: number,
    sheetName: string,
    title: string,
  ): Observable<boolean> {
    const titleRange: GridRange = {
      sheetId,
      startRowIndex: 3,
      endRowIndex: 4,
      startColumnIndex: 0,
      endColumnIndex: 7,
    };
    const mergeTitleCellsRequest: BatchUpdateRequest = {
      mergeCells: {
        range: titleRange,
        mergeType: 'MERGE_ALL',
      },
    };
    const centerTitleRequest: BatchUpdateRequest = {
      repeatCell: {
        range: titleRange,
        cell: {
          userEnteredFormat: {
            horizontalAlignment: 'CENTER',
          },
        },
        fields: 'userEnteredFormat.horizontalAlignment',
      },
    };

    return this.googleSheetService
      .batchUpdate$(spreadsheetId, [mergeTitleCellsRequest, centerTitleRequest])
      .pipe(
        switchMap(() => {
          return this.googleSheetService.writeCell(spreadsheetId, sheetName, 'A4', title);
        }),
        map(() => true),
      );
  }
}
