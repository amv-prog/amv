import { Dialog } from '@angular/cdk/dialog';
import { computed, inject, Service, Signal } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { filter, Observable, switchMap, tap } from 'rxjs';
import { ConfirmationDialog } from '../../shared/components/confirmation-dialog/confirmation-dialog';
import { DateService } from '../../shared/services/date-service';
import { MessageService } from '../../shared/services/message-service';
import { VersionStore } from '../../shared/version-store';
import { Family } from '../models/family';
import { Lesson } from '../models/lesson';
import { School } from '../models/school';
import { VolunteerMember } from '../models/volunteer-member';
import { FamilyStore } from '../stores/family-store';
import { LessonStore } from '../stores/lesson-store';
import { SchoolStore } from '../stores/school-store';
import { VolunteerStore } from '../stores/volunteer-store';
import * as exempleJson from './data-exemple.json';
import { DataService, SaveType } from './data-service';

@Service()
export class FileDataService {
  private readonly sanitizer = inject(DomSanitizer);
  private readonly dateService = inject(DateService);
  private readonly messageService = inject(MessageService);
  private readonly familyStore = inject(FamilyStore);
  private readonly volunteerStore = inject(VolunteerStore);
  private readonly lessonStore = inject(LessonStore);
  private readonly schoolStore = inject(SchoolStore);
  private readonly versionStore = inject(VersionStore);
  private readonly dataService = inject(DataService);

  private readonly dialog = inject(Dialog);

  saveFileName(): string {
    return `settings-${this.dateService.formatDate(new Date(), 'yyyyMMdd')}.json`;
  }

  sanitizedSettingsBlobUrl(): Signal<SafeUrl> {
    return computed(() => {
      const families = this.familyStore.families();
      const volunteers = this.volunteerStore.volunteers();
      const lessons = this.lessonStore.lessons();
      const schools = this.schoolStore.schools();
      const version = this.versionStore.version();
      const settings = new DataSaveModel(families, volunteers, lessons, version, schools);
      const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
      const blobUrl = window.URL.createObjectURL(blob);
      return this.sanitizer.bypassSecurityTrustUrl(blobUrl);
    });
  }

  async loadFile(file: File) {
    const text = await file.text();
    const settings = JSON.parse(text);
    const version = settings.version;
    const families = settings.families;
    const volunteers = settings.volunteers;
    const lessons = settings.lessons;
    const schools = settings.schools || [];
    if (!families || !volunteers || !lessons) {
      this.messageService.displayError(
        "Le fichier chargé n'est pas valide, les données n'ont pas été modifiées.",
      );
    } else {
      const data = new Map<string, any>();
      data.set(SaveType.FAMILIES, families);
      data.set(SaveType.LESSONS, lessons);
      data.set(SaveType.SCHOOLS, schools);
      data.set(SaveType.VOLUNTEERS, volunteers);
      data.set(SaveType.VERSION, version);
      this.updateData(data);
      this.validateSettingsImport(data);
    }
  }

  private updateData(data: Map<string, any>) {
    if (VersionStore.compare('0.1.2', data.get('version')) > 0) {
      for (const family of data.get(SaveType.FAMILIES)) {
        for (const member of family.members) {
          member.schoolClassIds = [];
        }
      }
    }
    data.set(SaveType.VERSION, this.versionStore.version());
  }

  private validateSettingsImport(data: Map<string, any>) {
    const dialogRef = this.dialog.open<boolean>(ConfirmationDialog, {
      panelClass: 'dialog',
      data: {
        text: 'Souhaitez-vous importer ces données ? Les données actuelles seront supprimées.',
      },
    });

    dialogRef.closed
      .pipe(
        filter((result) => !!result),
        switchMap(() => this.importSettings$(data)),
      )
      .subscribe();
  }

  importSettings$(dataMap: Map<string, any>): Observable<boolean> {
    return this.dataService
      .saveNewData$(dataMap)
      .pipe(tap(() => this.messageService.displaySuccess('Les données ont bien été chargées.')));
  }

  cleanData$(): Observable<boolean> {
    const cleanData = new Map<string, any>();
    cleanData.set(SaveType.VERSION, this.versionStore.version());
    return this.dataService
      .saveNewData$(cleanData)
      .pipe(tap(() => this.messageService.displaySuccess('Les données ont bien été supprimées.')));
  }

  importExemple$(): Observable<boolean> {
    const data = new Map<string, any>();
    data.set(SaveType.FAMILIES, exempleJson.families);
    data.set(SaveType.LESSONS, exempleJson.lessons);
    data.set(SaveType.SCHOOLS, exempleJson.schools);
    data.set(SaveType.VOLUNTEERS, exempleJson.volunteers);
    data.set(SaveType.VERSION, this.versionStore.version());
    return this.importSettings$(data);
  }
}

class DataSaveModel {
  constructor(
    public families: Family[],
    public volunteers: VolunteerMember[],
    public lessons: Lesson[],
    public version: string,
    public schools?: School[],
  ) {}
}
