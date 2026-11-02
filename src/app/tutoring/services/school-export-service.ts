import { inject, Service } from '@angular/core';
import { combineLatest, map, Observable, switchMap, throwError } from 'rxjs';
import { BatchUpdateRequest } from '../../shared/models/google-sheet/batch-update-request';
import { GridRange } from '../../shared/models/google-sheet/grid-range';
import { UpdateValuesResponse } from '../../shared/models/google-sheet/update-values-response';
import { GoogleSheetService } from '../../shared/services/google-sheet-service';
import { SchoolClassDisplay } from '../models/display/school-class-display';
import { SchoolDisplay } from '../models/display/school-display';
import { Family } from '../models/family';
import { RecipientMember } from '../models/recipient-member';
import { FamilyStore } from '../stores/family-store';
import { LessonStore } from '../stores/lesson-store';
import { SchoolStore } from '../stores/school-store';
import { SettingsStore } from '../stores/settings-store';

@Service()
export class SchoolExportService {
  private readonly cellBuffer = '     ';
  private readonly settingsStore = inject(SettingsStore);
  private readonly familyStore = inject(FamilyStore);
  private readonly schoolStore = inject(SchoolStore);
  private readonly googleSheetService = inject(GoogleSheetService);

  addSchoolSheet$(sheetName: string, schoolYear: number, title?: string): Observable<boolean> {
    const spreadsheetId = this.settingsStore.settings().spreadsheetId;
    if (!spreadsheetId) {
      throw new Error('Création impossible, pas de fichier saisi');
    }

    const schoolDisplays = SchoolStore.getSchoolDisplays(
      this.schoolStore.sortedSchools(),
      this.familyStore.families(),
    );

    return this.googleSheetService.addSheet$(spreadsheetId, sheetName).pipe(
      switchMap((response) => {
        const sheetId = response.replies.find((r) => !!r.addSheet)?.addSheet?.properties.sheetId;
        if (sheetId === undefined) {
          throwError(() => {
            return new Error("Impossible de retrouver l'id de la feuille");
          });
        }

        return this.updateSchoolSheet$(
          spreadsheetId,
          sheetName,
          sheetId!,
          schoolDisplays,
          schoolYear,
          3,
        );
      }),
    );
  }

  private updateSchoolSheet$(
    spreadsheetId: string,
    sheetName: string,
    sheetId: number,
    schoolDisplays: SchoolDisplay[],
    year: number,
    firstIndex: number,
  ): Observable<boolean> {
    const requests$: Observable<UpdateValuesResponse>[] = [];
    const formatRequests: BatchUpdateRequest[] = [];

    let nextIndex = firstIndex;
    for (let schoolDisplay of schoolDisplays) {
      const {
        dataRequests$: classDataRequests$,
        formatRequests: classFormatRequests,
        nextIndex: nextAvailableIndex,
      } = this.writeSchool$(spreadsheetId, sheetName, sheetId, schoolDisplay, year, nextIndex + 2);
      requests$.push(...classDataRequests$);
      formatRequests.push(...classFormatRequests);
      nextIndex = nextAvailableIndex;
    }

    return combineLatest(requests$).pipe(
      switchMap(() => this.googleSheetService.batchUpdate$(spreadsheetId, formatRequests)),
      map(() => true),
    );
  }

  // Cette méthode renvoie les requêtes pour écrire les infos d'une école à partir de la ligne "firstIndex" fournie en paramètre
  // Le prochain index non écrit est également renvoyé. Attention, le numéro de ligne commence à 1 et l'index à 0.
  private writeSchool$(
    spreadsheetId: string,
    sheetName: string,
    sheetId: number,
    schoolDisplay: SchoolDisplay,
    year: number,
    firstIndex: number,
  ): {
    dataRequests$: Observable<UpdateValuesResponse>[];
    formatRequests: BatchUpdateRequest[];
    nextIndex: number;
  } {
    const yearClasses = schoolDisplay.classes
      .filter((schoolClassDisplay) => schoolClassDisplay.schoolClass.year === year)
      .filter((schoolClassDisplay) => schoolClassDisplay.members.length > 0);

    if (yearClasses.length === 0) {
      return { dataRequests$: [], formatRequests: [], nextIndex: firstIndex };
    } else {
      const dataRequests$: Observable<UpdateValuesResponse>[] = [];
      const formatRequests = this.schoolFormatRequests(sheetId, firstIndex);
      // Nom de l'école
      dataRequests$.push(
        this.googleSheetService.writeCell(
          spreadsheetId,
          sheetName,
          `A${firstIndex + 1}`,
          schoolDisplay.school.name,
        ),
      );

      // Classes
      let nextIndex = firstIndex + 1;
      for (let classDisplay of yearClasses) {
        const {
          dataRequests$: classDataRequests$,
          formatRequests: classFormatRequests,
          nextIndex: nextAvailableIndex,
        } = this.writeClassData$(spreadsheetId, sheetName, sheetId, classDisplay, nextIndex + 1);
        dataRequests$.push(...classDataRequests$);
        formatRequests.push(...classFormatRequests);
        nextIndex = nextAvailableIndex;
      }
      return {
        dataRequests$,
        formatRequests: formatRequests,
        nextIndex,
      };
    }
  }

  private schoolFormatRequests(sheetId: number, firstIndex: number): BatchUpdateRequest[] {
    const formatRequests: BatchUpdateRequest[] = [];
    const schoolNameRange: GridRange = {
      sheetId,
      startRowIndex: firstIndex,
      endRowIndex: firstIndex + 1,
      startColumnIndex: 0,
      endColumnIndex: 3,
    };

    // Fusionner les cellules pour le nom de l'école
    const mergeCellsRequest: BatchUpdateRequest = {
      mergeCells: {
        range: schoolNameRange,
        mergeType: 'MERGE_ROWS',
      },
    };
    formatRequests.push(mergeCellsRequest);

    // Nom de l'école en gras
    const boldRequest: BatchUpdateRequest = {
      repeatCell: {
        range: schoolNameRange,
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
    formatRequests.push(boldRequest);

    // Nom de l'école encadré
    const borderRequest: BatchUpdateRequest = {
      updateBorders: {
        range: schoolNameRange,
        top: {
          style: 'SOLID',
        },
        bottom: {
          style: 'SOLID',
        },
        left: {
          style: 'SOLID',
        },
        right: {
          style: 'SOLID',
        },
        innerHorizontal: {
          style: 'NONE',
        },
        innerVertical: {
          style: 'NONE',
        },
      },
    };
    formatRequests.push(borderRequest);

    return formatRequests;
  }

  // Cette méthode renvoie les requêtes pour écrire les infos d'une classe à partir de la ligne "firstIndex" fournie en paramètre
  // Le prochain index non écrit est également renvoyé.
  private writeClassData$(
    spreadsheetId: string,
    sheetName: string,
    sheetId: number,
    classDisplay: SchoolClassDisplay,
    firstIndex: number,
  ): {
    dataRequests$: Observable<UpdateValuesResponse>[];
    formatRequests: BatchUpdateRequest[];
    nextIndex: number;
  } {
    const dataRequests$: Observable<UpdateValuesResponse>[] = [];

    // Nom de la classe
    dataRequests$.push(
      this.googleSheetService.writeCell(
        spreadsheetId,
        sheetName,
        `A${firstIndex + 1}`,
        this.classDisplayName(classDisplay),
      ),
    );

    // Élèves
    let nextIndex = firstIndex;
    for (let student of classDisplay.members) {
      const { requests$: studentDataRequests$, nextIndex: nextAvailableIndex } =
        this.writeClassMemberData$(spreadsheetId, sheetName, student, nextIndex + 1);
      dataRequests$.push(...studentDataRequests$);
      nextIndex = nextAvailableIndex;
    }

    return {
      dataRequests$,
      formatRequests: this.classFormatRequests(sheetId, firstIndex),
      nextIndex,
    };
  }

  private classFormatRequests(sheetId: number, firstIndex: number): BatchUpdateRequest[] {
    const formatRequests: BatchUpdateRequest[] = [];
    const classNameRange: GridRange = {
      sheetId,
      startRowIndex: firstIndex,
      endRowIndex: firstIndex + 1,
      startColumnIndex: 0,
      endColumnIndex: 3,
    };

    // Fusionner les cellules pour le nom de la classe
    const mergeCellsRequest: BatchUpdateRequest = {
      mergeCells: {
        range: classNameRange,
        mergeType: 'MERGE_ROWS',
      },
    };
    formatRequests.push(mergeCellsRequest);

    // Nom de la classe en gras et souligné
    const boldRequest: BatchUpdateRequest = {
      repeatCell: {
        range: classNameRange,
        cell: {
          userEnteredFormat: {
            textFormat: {
              bold: true,
              underline: true,
            },
          },
        },
        fields: 'userEnteredFormat.textFormat',
      },
    };
    formatRequests.push(boldRequest);

    return formatRequests;
  }

  private classDisplayName(classDisplay: SchoolClassDisplay): string {
    return `${classDisplay.schoolClass.grades.join(' / ')} ${classDisplay.schoolClass.teachers.join(', ')}`;
  }

  // Cette méthode renvoie les requêtes pour écrire les infos d'un élève à partir de la ligne "firstIndex" fournie en paramètre
  // Le prochain index non écrit est également renvoyé.
  private writeClassMemberData$(
    spreadsheetId: string,
    sheetName: string,
    student: { member: RecipientMember; family: Family },
    firstIndex: number,
  ): { requests$: Observable<UpdateValuesResponse>[]; nextIndex: number } {
    const requests$: Observable<UpdateValuesResponse>[] = [];

    // Nom de l'élève
    requests$.push(
      this.googleSheetService.writeCell(
        spreadsheetId,
        sheetName,
        `A${firstIndex + 1}`,
        this.displayStudentName(student) + this.cellBuffer,
      ),
    );
    let nextIndex = firstIndex + 1;

    // Lessons

    return { requests$, nextIndex };
  }

  private displayStudentName(
    student: { member: RecipientMember; family: Family } | undefined,
  ): string {
    return !!student ? LessonStore.displayStudentName(student) : 'Inconnu';
  }
}
