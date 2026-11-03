import { inject, Service } from '@angular/core';
import { combineLatest, map, Observable, switchMap, throwError } from 'rxjs';
import { BatchUpdateRequest } from '../../shared/models/google-sheet/batch-update-request';
import { Dimension } from '../../shared/models/google-sheet/dimension';
import { GridRange } from '../../shared/models/google-sheet/grid-range';
import { UpdateValuesResponse } from '../../shared/models/google-sheet/update-values-response';
import { DateService } from '../../shared/services/date-service';
import { GoogleSheetService } from '../../shared/services/google-sheet-service';
import { SchoolClassDisplay } from '../models/display/school-class-display';
import { SchoolDisplay } from '../models/display/school-display';
import { Family } from '../models/family';
import { Lesson } from '../models/lesson';
import { RecipientMember } from '../models/recipient-member';
import { VolunteerMember } from '../models/volunteer-member';
import { FamilyStore } from '../stores/family-store';
import { LessonStore } from '../stores/lesson-store';
import { SchoolStore } from '../stores/school-store';
import { SettingsStore } from '../stores/settings-store';
import { VolunteerStore } from '../stores/volunteer-store';

@Service()
export class SchoolExportService {
  private readonly cellBuffer = '     ';
  private readonly settingsStore = inject(SettingsStore);
  private readonly familyStore = inject(FamilyStore);
  private readonly schoolStore = inject(SchoolStore);
  private readonly lessonStore = inject(LessonStore);
  private readonly volunteerStore = inject(VolunteerStore);
  private readonly googleSheetService = inject(GoogleSheetService);
  private readonly dateService = inject(DateService);

  // On prend l'année scolaire en cours à partir de septembre
  private readonly schoolYear = SchoolStore.currentSchoolYear(8);
  protected readonly daysMap = this.dateService.daysMap;

  addSchoolSheet$(sheetName: string, title?: string): Observable<boolean> {
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
          4,
          title,
        );
      }),
    );
  }

  private updateSchoolSheet$(
    spreadsheetId: string,
    sheetName: string,
    sheetId: number,
    schoolDisplays: SchoolDisplay[],
    firstIndex: number,
    title?: string,
  ): Observable<boolean> {
    const requests$: Observable<UpdateValuesResponse>[] = [];
    const formatRequests: BatchUpdateRequest[] = [];

    const students = new Set<string>();
    const tutors = new Set<string>();

    let nextIndex = firstIndex;
    for (let schoolDisplay of schoolDisplays) {
      const {
        dataRequests$: classDataRequests$,
        formatRequests: classFormatRequests,
        nextIndex: nextAvailableIndex,
      } = this.writeSchool$(
        spreadsheetId,
        sheetName,
        sheetId,
        schoolDisplay,
        nextIndex,
        students,
        tutors,
      );
      requests$.push(...classDataRequests$);
      formatRequests.push(...classFormatRequests);
      nextIndex = nextAvailableIndex;
    }

    // Ajout des en-têtes
    const { dataRequests$: headersDataRequests$, formatRequests: headersFormatRequests } =
      this.writeHeaders$(spreadsheetId, sheetName, sheetId, students, tutors, title);
    requests$.push(...headersDataRequests$);
    formatRequests.push(...headersFormatRequests);

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
    firstIndex: number,
    students: Set<string>,
    tutors: Set<string>,
  ): {
    dataRequests$: Observable<UpdateValuesResponse>[];
    formatRequests: BatchUpdateRequest[];
    nextIndex: number;
  } {
    const yearClasses = schoolDisplay.classes
      .filter((schoolClassDisplay) => schoolClassDisplay.schoolClass.year === this.schoolYear)
      .filter((schoolClassDisplay) => schoolClassDisplay.members.length > 0);

    if (yearClasses.length === 0) {
      return { dataRequests$: [], formatRequests: [], nextIndex: firstIndex };
    } else {
      const dataRequests$: Observable<UpdateValuesResponse>[] = [];
      const formatRequests = this.schoolFormatRequests(sheetId, firstIndex);

      // Classes
      let nextIndex = firstIndex + 3;
      for (let classDisplay of yearClasses) {
        const {
          dataRequests$: classDataRequests$,
          formatRequests: classFormatRequests,
          nextIndex: nextAvailableIndex,
        } = this.writeClassData$(
          spreadsheetId,
          sheetName,
          sheetId,
          classDisplay,
          nextIndex,
          students,
          tutors,
        );
        dataRequests$.push(...classDataRequests$);
        formatRequests.push(...classFormatRequests);
        nextIndex = nextAvailableIndex;
      }

      if (dataRequests$.length === 0) {
        // Aucun enfant n'est suivi dans cette école, on ne l'affiche pas
        return { dataRequests$: [], formatRequests: [], nextIndex: firstIndex };
      }

      // Nom de l'école
      dataRequests$.push(
        this.googleSheetService.writeCell(
          spreadsheetId,
          sheetName,
          `A${firstIndex + 3}`,
          schoolDisplay.school.name,
        ),
      );

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
      startRowIndex: firstIndex + 2,
      endRowIndex: firstIndex + 3,
      startColumnIndex: 0,
      endColumnIndex: 4,
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
    students: Set<string>,
    tutors: Set<string>,
  ): {
    dataRequests$: Observable<UpdateValuesResponse>[];
    formatRequests: BatchUpdateRequest[];
    nextIndex: number;
  } {
    const dataRequests$: Observable<UpdateValuesResponse>[] = [];

    // Élèves
    let nextIndex = firstIndex + 1;
    for (let student of classDisplay.members) {
      const { requests$: studentDataRequests$, nextIndex: nextAvailableIndex } =
        this.writeClassMemberData$(spreadsheetId, sheetName, student, nextIndex, students, tutors);
      dataRequests$.push(...studentDataRequests$);
      nextIndex = nextAvailableIndex;
    }

    if (dataRequests$.length === 0) {
      // Aucun enfant n'est suivi dans cette classe, on ne l'affiche pas
      return { dataRequests$: [], formatRequests: [], nextIndex: firstIndex };
    }
    // Nom de la classe
    dataRequests$.push(
      this.googleSheetService.writeCell(
        spreadsheetId,
        sheetName,
        `A${firstIndex + 2}`,
        this.classDisplayName(classDisplay),
      ),
    );

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
      startRowIndex: firstIndex + 1,
      endRowIndex: firstIndex + 2,
      startColumnIndex: 0,
      endColumnIndex: 4,
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
    students: Set<string>,
    tutors: Set<string>,
  ): { requests$: Observable<UpdateValuesResponse>[]; nextIndex: number } {
    const requests$: Observable<UpdateValuesResponse>[] = [];

    const tutorLessons = this.tutorLessons(student.member.id);
    // Si l'élève n'a pas de lesson, il n'est pas suivi et on ne l'affiche pas
    if (tutorLessons.length === 0) {
      return { requests$: [], nextIndex: firstIndex };
    }

    // Nom de l'élève
    requests$.push(
      this.googleSheetService.writeCell(
        spreadsheetId,
        sheetName,
        `A${firstIndex + 2}`,
        this.displayStudentName(student) + this.cellBuffer,
      ),
    );
    students.add(student.member.id);

    // Lessons
    const values: string[][] = [];
    let lastTutorId: string = '';
    for (let { lesson, tutor } of tutorLessons) {
      tutors.add(lesson.tutorId);
      const lessonValues: string[] = [];

      // Nom du tuteur
      if (tutor?.id !== lastTutorId) {
        lessonValues.push((tutor?.firstName ?? 'Inconnu') + this.cellBuffer);
        lastTutorId = tutor?.id ?? 'Inconnu';
      } else {
        lessonValues.push('');
      }

      // Jour et heure
      lessonValues.push(`${this.daysMap.get(lesson.dayOfWeek)} ${lesson.time} ${this.cellBuffer}`);
      // Lieu
      lessonValues.push((lesson.place === 'ASSOCIATION' ? 'Local' : 'Domicile') + this.cellBuffer);

      values.push(lessonValues);
    }
    requests$.push(
      this.googleSheetService.writeCells(spreadsheetId, sheetName, `B${firstIndex + 2}`, values),
    );

    return { requests$, nextIndex: firstIndex + 1 + tutorLessons.length };
  }

  private displayStudentName(
    student: { member: RecipientMember; family: Family } | undefined,
  ): string {
    return !!student ? LessonStore.displayStudentName(student) : 'Inconnu';
  }

  private tutorLessons(studentId: string) {
    const tutorsMap = this.volunteerStore.tutorsMap();
    const currentDate = new Date();

    return this.lessonStore
      .lessons()
      .filter((lesson) => lesson.studentId === studentId)
      .filter((lesson) => {
        return !lesson.endDate || DateService.compareDays(lesson.endDate, currentDate) >= 0;
      })
      .filter((lesson) => {
        return DateService.compareDays(lesson.startDate, currentDate) <= 0;
      })
      .map((lesson) => {
        const tutor = tutorsMap.get(lesson.tutorId);

        return { lesson, tutor };
      })
      .sort(this.compareLessons);
  }

  private compareLessons(
    l1: { lesson: Lesson; tutor: VolunteerMember | undefined },
    l2: { lesson: Lesson; tutor: VolunteerMember | undefined },
  ): number {
    // D'abord on trie par tuteur
    if (l1.tutor?.id === l2.tutor?.id) {
      // Ensuite on trie par jour de lesson
      return LessonStore.compareLessonsDays(l1.lesson, l2.lesson);
    } else {
      const n1 = SchoolExportService.sortingTutorName(l1.tutor);
      const n2 = SchoolExportService.sortingTutorName(l2.tutor);
      return n1.localeCompare(n2);
    }
  }

  private static sortingTutorName(tutor: VolunteerMember | undefined): string {
    // Pour trier les tuteurs on ajoute l'ID, au cas où plusieurs tuteurs aient le même nom
    return !!tutor ? `${tutor.firstName} ${tutor.lastName} ${tutor.id}` : 'ZZZ';
  }

  private writeHeaders$(
    spreadsheetId: string,
    sheetName: string,
    sheetId: number,
    students: Set<string>,
    tutors: Set<string>,
    title?: string,
  ): {
    dataRequests$: Observable<UpdateValuesResponse>[];
    formatRequests: BatchUpdateRequest[];
  } {
    const requests$: Observable<UpdateValuesResponse>[] = [];
    const formatRequests: BatchUpdateRequest[] = [];

    // Global format
    const mergeHeadersCellsRequest: BatchUpdateRequest = {
      mergeCells: {
        range: {
          sheetId,
          startRowIndex: 0,
          endRowIndex: 5,
          startColumnIndex: 0,
          endColumnIndex: 4,
        },
        mergeType: 'MERGE_ROWS',
      },
    };
    formatRequests.push(mergeHeadersCellsRequest);

    const centerHeadersRequest: BatchUpdateRequest = {
      repeatCell: {
        range: {
          sheetId,
          startRowIndex: 1,
          endRowIndex: 5,
          startColumnIndex: 0,
          endColumnIndex: 4,
        },
        cell: {
          userEnteredFormat: {
            horizontalAlignment: 'CENTER',
          },
        },
        fields: 'userEnteredFormat.horizontalAlignment',
      },
    };
    formatRequests.push(centerHeadersRequest);

    const boldRequest: BatchUpdateRequest = {
      repeatCell: {
        range: {
          sheetId,
          startRowIndex: 1,
          endRowIndex: 4,
          startColumnIndex: 0,
          endColumnIndex: 4,
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
    formatRequests.push(boldRequest);

    // Date
    const { request$: dateRequest$, formatRequest: dateFormatRequest } = this.writeDate$(
      spreadsheetId,
      sheetName,
      sheetId,
    );
    requests$.push(dateRequest$);
    formatRequests.push(dateFormatRequest);

    // Title
    if (!!title) {
      requests$.push(this.googleSheetService.writeCell(spreadsheetId, sheetName, 'A3', title));
    }

    // Compteurs
    requests$.push(
      this.googleSheetService.writeCell(
        spreadsheetId,
        sheetName,
        'A4',
        `${students.size} enfants ${tutors.size} accompagnateurs·trices`,
      ),
    );

    // Resize and wrap after everything else
    const resizeColRequest: BatchUpdateRequest = {
      autoResizeDimensions: {
        dimensions: {
          sheetId,
          dimension: Dimension.COLUMNS,
          startIndex: 0,
          endIndex: 4,
        },
      },
    };
    formatRequests.push(resizeColRequest);

    const warpRequest: BatchUpdateRequest = {
      repeatCell: {
        range: {
          sheetId,
          startRowIndex: 0,
          startColumnIndex: 0,
          endColumnIndex: 4,
        },
        cell: {
          userEnteredFormat: {
            wrapStrategy: 'WRAP',
          },
        },
        fields: 'userEnteredFormat.wrapStrategy',
      },
    };
    formatRequests.push(warpRequest);

    return {
      dataRequests$: requests$,
      formatRequests,
    };
  }

  private writeDate$(
    spreadsheetId: string,
    sheetName: string,
    sheetId: number,
  ): {
    request$: Observable<UpdateValuesResponse>;
    formatRequest: BatchUpdateRequest;
  } {
    const date = this.dateService.formatDate(new Date(), 'yyyy-MM-dd h:mm:ss') || '';

    const alignDateRequest: BatchUpdateRequest = {
      repeatCell: {
        range: {
          sheetId,
          startRowIndex: 0,
          endRowIndex: 1,
          startColumnIndex: 0,
          endColumnIndex: 4,
        },
        cell: {
          userEnteredFormat: {
            horizontalAlignment: 'RIGHT',
          },
        },
        fields: 'userEnteredFormat.horizontalAlignment',
      },
    };

    return {
      request$: this.googleSheetService.writeCell(spreadsheetId, sheetName, 'D1', date),
      formatRequest: alignDateRequest,
    };
  }
}
