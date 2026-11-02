import { inject, Service } from '@angular/core';
import { combineLatest, map, Observable, switchMap, throwError } from 'rxjs';
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

        return this.updateSchoolSheet$(spreadsheetId, sheetName, schoolDisplays, schoolYear, 3);
      }),
    );
  }

  private updateSchoolSheet$(
    spreadsheetId: string,
    sheetName: string,
    schoolDisplays: SchoolDisplay[],
    year: number,
    firstIndex: number,
  ): Observable<boolean> {
    const requests$: Observable<UpdateValuesResponse>[] = [];

    let nextIndex = firstIndex;
    for (let schoolDisplay of schoolDisplays) {
      const { requests$: classDataRequests$, nextIndex: nextAvailableIndex } =
        this.writeSchoolData$(spreadsheetId, sheetName, schoolDisplay, year, nextIndex + 2);
      requests$.push(...classDataRequests$);
      nextIndex = nextAvailableIndex;
    }

    return combineLatest(requests$).pipe(map(() => true));
  }

  // Cette méthode renvoie les requêtes pour écrire les infos d'une école à partir de la ligne "firstIndex" fournie en paramètre
  // Le prochain index non écrit est également renvoyé. Attention, le numéro de ligne commence à 1 et l'index à 0.
  private writeSchoolData$(
    spreadsheetId: string,
    sheetName: string,
    schoolDisplay: SchoolDisplay,
    year: number,
    firstIndex: number,
  ): { requests$: Observable<UpdateValuesResponse>[]; nextIndex: number } {
    const yearClasses = schoolDisplay.classes
      .filter((schoolClassDisplay) => schoolClassDisplay.schoolClass.year === year)
      .filter((schoolClassDisplay) => schoolClassDisplay.members.length > 0);

    if (yearClasses.length === 0) {
      return { requests$: [], nextIndex: firstIndex };
    } else {
      const requests$: Observable<UpdateValuesResponse>[] = [];
      // Nom de l'école
      requests$.push(
        this.googleSheetService.writeCell(
          spreadsheetId,
          sheetName,
          `A${firstIndex + 1}`,
          schoolDisplay.school.name,
        ),
      );

      // classes
      let nextIndex = firstIndex + 1;
      for (let classDisplay of yearClasses) {
        const { requests$: classDataRequests$, nextIndex: nextAvailableIndex } =
          this.writeClassData$(spreadsheetId, sheetName, classDisplay, nextIndex + 1);
        requests$.push(...classDataRequests$);
        nextIndex = nextAvailableIndex;
      }
      return { requests$, nextIndex };
    }
  }

  // Cette méthode renvoie les requêtes pour écrire les infos d'une classe à partir de la ligne "firstIndex" fournie en paramètre
  // Le prochain index non écrit est également renvoyé.
  private writeClassData$(
    spreadsheetId: string,
    sheetName: string,
    classDisplay: SchoolClassDisplay,
    firstIndex: number,
  ): { requests$: Observable<UpdateValuesResponse>[]; nextIndex: number } {
    const requests$: Observable<UpdateValuesResponse>[] = [];

    // Nom de la classe
    requests$.push(
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
      requests$.push(...studentDataRequests$);
      nextIndex = nextAvailableIndex;
    }

    return { requests$, nextIndex };
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
        this.displayStudentName(student),
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
