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
import { Family } from '../models/family';
import { RecipientMember } from '../models/recipient-member';
import { FamilyStore } from '../stores/family-store';
import { LessonStore } from '../stores/lesson-store';
import { SettingsStore } from '../stores/settings-store';

@Service()
export class FamilyExportService {
  private readonly cellBuffer = '     ';
  private readonly settingsStore = inject(SettingsStore);
  private readonly familyStore = inject(FamilyStore);
  private readonly googleSheetService = inject(GoogleSheetService);
  private readonly lessonStore = inject(LessonStore);
  private readonly dateService = inject(DateService);

  addFamilySheet$(sheetName: string, includeAll: boolean, title?: string): Observable<boolean> {
    const spreadsheetId = this.settingsStore.settings().spreadsheetId;
    if (!spreadsheetId) {
      throw new Error('Création impossible, pas de fichier saisi');
    }

    const families = includeAll
      ? this.familyStore.sortedFamilies()
      : this.familyStore.sortedFamilies().filter((f) => this.includeFamily(f));

    return this.googleSheetService.addSheet$(spreadsheetId, sheetName).pipe(
      switchMap((response) => {
        const sheetId = response.replies.find((r) => !!r.addSheet)?.addSheet?.properties.sheetId;
        if (sheetId === undefined) {
          throwError(() => {
            return new Error("Impossible de retrouver l'id de la feuille");
          });
        }

        // On insère les données
        return this.updateFamilySheetData$(spreadsheetId, sheetName, families).pipe(
          switchMap((sizes) => {
            // On met à jour le style de la page
            return this.updateFamilySheetFormat$(spreadsheetId, sheetId!, sizes);
          }),
          switchMap(() => {
            // On ajoute le titre
            if (!!title) {
              return this.addTitle$(spreadsheetId, sheetId!, sheetName, title);
            } else {
              return of(true);
            }
          }),
        );
      }),
    );
  }

  private includeFamily(family: Family): boolean {
    const lessons = this.lessonStore.lessons();
    for (let member of family.members) {
      const notEndedLessons = lessons
        .filter((lesson) => lesson.studentId === member.id)
        .filter((lesson) => {
          return !lesson.endDate || DateService.compareDays(lesson.endDate, new Date()) >= 0;
        });
      if (notEndedLessons.length > 0) {
        return true;
      }
    }
    return false;
  }

  private updateFamilySheetData$(
    spreadsheetId: string,
    sheetName: string,
    families: Family[],
  ): Observable<number[]> {
    const requests$: Observable<UpdateValuesResponse>[] = [];

    const date = this.dateService.formatDate(new Date(), 'yyyy-MM-dd h:mm:ss') || '';
    requests$.push(this.googleSheetService.writeCell(spreadsheetId, sheetName, 'H1', date));

    requests$.push(
      this.googleSheetService.writeCell(
        spreadsheetId,
        sheetName,
        'A6',
        'FAMILLES' + this.cellBuffer,
      ),
    );

    const familiesData = this.familiesData(families);
    const values = [this.familyHeader(), ...familiesData[0]];
    requests$.push(this.googleSheetService.writeCells(spreadsheetId, sheetName, 'A7', values));

    return combineLatest(requests$).pipe(map(() => familiesData[1]));
  }

  private familyHeader(): string[] {
    return [
      'Nom' + this.cellBuffer,
      'Adresse' + this.cellBuffer,
      "Complément d'adresse" + this.cellBuffer,
      'CP - Ville' + this.cellBuffer,
      'Prénom' + this.cellBuffer,
      'Mail' + this.cellBuffer,
      'Téléphone' + this.cellBuffer,
      'Contribution' + this.cellBuffer,
    ];
  }

  private familiesData(families: Family[]): [string[][], number[]] {
    const sizes: number[] = [];
    const data = families.flatMap((f) => {
      const lines = this.familyData(f);
      sizes.push(lines.length);
      return lines;
    });

    return [data, sizes];
  }

  private familyData(family: Family): string[][] {
    const familyGlobalData = this.familyGlobalData(family);
    const contributionString = this.isContributionValid(family) ? 'Validée' : '';
    const parents = family.members.filter((m) => m.isParent);
    if (parents.length === 0) {
      return [this.memberData(family, undefined, familyGlobalData, contributionString)];
    } else {
      const data: string[][] = [];
      for (let parent of parents) {
        data.push(this.memberData(family, parent, familyGlobalData, contributionString));
      }
      return data;
    }
  }

  private memberData(
    family: Family,
    member: RecipientMember | undefined,
    familyGlobalData: string[],
    contributionString: string,
  ): string[] {
    const data: string[] = [];
    data.push(...familyGlobalData);
    if (!!member) {
      data.push(...this.memberSpecificData(family, member));
    } else {
      data.push('', '', '');
    }
    data.push(contributionString);

    return data;
  }

  private familyGlobalData(family: Family): string[] {
    const data: string[] = [];

    data.push(family.name + this.cellBuffer);
    data.push((family.address?.street || '') + this.cellBuffer);
    data.push((family.address?.additional || '') + this.cellBuffer);
    data.push(this.addressCodeCity(family.address) + this.cellBuffer);
    return data;
  }

  private memberSpecificData(family: Family, member: RecipientMember): string[] {
    const data: string[] = [];

    const differentName = member.lastName === family.name ? '' : ` (${member.lastName})`;
    data.push(`${member.firstName}${differentName}` + this.cellBuffer);
    data.push((member.email || '') + this.cellBuffer);
    data.push(member.phoneNumbers.join(', ') + this.cellBuffer);
    return data;
  }

  public isContributionValid(family: Family): boolean {
    return DateService.compareDays(family.contributionValidity, new Date()) >= 0;
  }

  private addressCodeCity(address: Address | undefined): string {
    return [address?.postCode, address?.city].filter((data) => !!data).join(' - ');
  }

  private updateFamilySheetFormat$(
    spreadsheetId: string,
    sheetId: number,
    sizes: number[],
  ): Observable<boolean> {
    const totalDataSize = sizes.reduce((sum, current) => sum + current, 0);
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

    const alignDateRequest: BatchUpdateRequest = {
      repeatCell: {
        range: {
          sheetId,
          startRowIndex: 0,
          endRowIndex: 1,
          startColumnIndex: 7,
          endColumnIndex: 8,
        },
        cell: {
          userEnteredFormat: {
            horizontalAlignment: 'RIGHT',
          },
        },
        fields: 'userEnteredFormat.horizontalAlignment',
      },
    };

    const mergeCellsRequest: BatchUpdateRequest = {
      mergeCells: {
        range: {
          sheetId,
          startRowIndex: 0,
          endRowIndex: 6,
          startColumnIndex: 0,
          endColumnIndex: 8,
        },
        mergeType: 'MERGE_ROWS',
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
      endColumnIndex: 8,
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
          endRowIndex: 7 + totalDataSize,
          startColumnIndex: 0,
          endColumnIndex: 8,
        },
        top: borderMediumStyle,
        bottom: borderMediumStyle,
        left: borderMediumStyle,
        right: borderMediumStyle,
        innerHorizontal: borderSolidStyle,
        innerVertical: borderSolidStyle,
      },
    };

    const centerHeaderRequest: BatchUpdateRequest = {
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
          endIndex: 8,
        },
      },
    };

    const warpRequest: BatchUpdateRequest = {
      repeatCell: {
        range: {
          sheetId,
          startRowIndex: 0,
          endRowIndex: 7 + totalDataSize,
          startColumnIndex: 0,
          endColumnIndex: 8,
        },
        cell: {
          userEnteredFormat: {
            wrapStrategy: 'WRAP',
          },
        },
        fields: 'userEnteredFormat.wrapStrategy',
      },
    };

    const requests = [
      centerVerticalRequest,
      alignDateRequest,
      mergeCellsRequest,
      boldRequest,
      headerBorderRequest,
      centerHeaderRequest,
      tableBorderRequest,
      resizeColRequest,
      warpRequest,
    ];

    // On fusionne les lignes d'une même famille
    let index = 7;
    for (let size of sizes) {
      requests.push(...this.mergeRequests(sheetId, index, size));
      index = index + size;
    }

    return this.googleSheetService.batchUpdate$(spreadsheetId, requests).pipe(map(() => true));
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
      endColumnIndex: 8,
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

    return this.googleSheetService.batchUpdate$(spreadsheetId, [centerTitleRequest]).pipe(
      switchMap(() => {
        return this.googleSheetService.writeCell(spreadsheetId, sheetName, 'A4', title);
      }),
      map(() => true),
    );
  }

  private mergeRequests(sheetId: number, firstIndex: number, length: number): BatchUpdateRequest[] {
    if (length <= 1) {
      return [];
    }

    const mergeLeftCellsRequest: BatchUpdateRequest = {
      mergeCells: {
        range: {
          sheetId,
          startRowIndex: firstIndex,
          endRowIndex: firstIndex + length,
          startColumnIndex: 0,
          endColumnIndex: 4,
        },
        mergeType: 'MERGE_COLUMNS',
      },
    };

    const mergeRightCellsRequest: BatchUpdateRequest = {
      mergeCells: {
        range: {
          sheetId,
          startRowIndex: firstIndex,
          endRowIndex: firstIndex + length,
          startColumnIndex: 7,
          endColumnIndex: 8,
        },
        mergeType: 'MERGE_COLUMNS',
      },
    };

    return [mergeLeftCellsRequest, mergeRightCellsRequest];
  }
}
