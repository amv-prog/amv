import { Dialog } from '@angular/cdk/dialog';
import { Component, computed, inject, Signal } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { tap } from 'rxjs';
import { ConfirmationDialog } from '../../../shared/components/confirmation-dialog/confirmation-dialog';
import { DateService } from '../../../shared/services/date-service';
import { MessageService } from '../../../shared/services/message-service';
import { VersionStore } from '../../../shared/version-store';
import { Family } from '../../models/family';
import { Lesson } from '../../models/lesson';
import { VolunteerMember } from '../../models/volunteer-member';
import { FamilyStore } from '../../stores/family-store';
import { LessonStore } from '../../stores/lesson-store';
import { VolunteerStore } from '../../stores/volunteer-store';
import * as exempleJson from './settings-exemple.json';

@Component({
  selector: 'amv-settings',
  imports: [],
  templateUrl: './settings.html',
})
export class Settings {
  private readonly sanitizer = inject(DomSanitizer);
  private readonly dateService = inject(DateService);
  private readonly familyStore = inject(FamilyStore);
  private readonly volunteerStore = inject(VolunteerStore);
  private readonly lessonStore = inject(LessonStore);
  private readonly versionStore = inject(VersionStore);
  private readonly messageService = inject(MessageService);

  private readonly dialog = inject(Dialog);

  protected readonly sanitizedBlobUrl: Signal<SafeUrl>;
  protected readonly fileName: string;

  constructor() {
    this.fileName = `settings-${this.dateService.formatDate(new Date(), 'yyyyMMdd')}.json`;
    this.sanitizedBlobUrl = computed(() => {
      const families = this.familyStore.families();
      const volunteers = this.volunteerStore.volunteers();
      const lessons = this.lessonStore.lessons();
      const version = this.versionStore.version();
      const settings = new SettingsModel(families, volunteers, lessons, version);
      const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
      const blobUrl = window.URL.createObjectURL(blob);
      return this.sanitizer.bypassSecurityTrustUrl(blobUrl);
    });
  }

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if (!!input.files?.length) {
      const file = input.files![0];
      const text = await file.text();
      const settings = JSON.parse(text);
      const version = settings.version;
      const families = settings.families;
      const volunteers = settings.volunteers;
      const lessons = settings.lessons;
      if (!families || !volunteers || !lessons) {
        this.messageService.displayError(
          "Le fichier chargé n'est pas valide, les données n'ont pas été modifiées.",
        );
      } else {
        this.validateSettingsImport(new SettingsModel(families, volunteers, lessons, version));
      }
    }
    input.value = '';
  }

  private validateSettingsImport(settings: SettingsModel) {
    const dialogRef = this.dialog.open<boolean>(ConfirmationDialog, {
      panelClass: 'dialog',
      data: {
        text: 'Souhaitez-vous importer ces données ? Les données actuelles seront supprimées.',
      },
    });

    dialogRef.closed
      .pipe(
        tap((result) => {
          if (!!result) {
            this.importSettings(settings);
          }
        }),
      )
      .subscribe();
  }

  private importSettings(settings: SettingsModel) {
    this.familyStore.replaceFamilies(settings.families);
    this.volunteerStore.replaceVolunteers(settings.volunteers);
    this.lessonStore.replaceLessons(settings.lessons);
    this.messageService.displaySuccess('Les données ont bien été chargées.');
  }

  validateCleanData() {
    const dialogRef = this.dialog.open<boolean>(ConfirmationDialog, {
      panelClass: 'dialog',
      data: {
        text: 'Souhaitez-vous vraiment supprimer vos données ?',
      },
    });

    dialogRef.closed
      .pipe(
        tap((result) => {
          if (!!result) {
            this.cleanData();
          }
        }),
      )
      .subscribe();
  }

  private cleanData() {
    this.familyStore.replaceFamilies([]);
    this.volunteerStore.replaceVolunteers([]);
    this.lessonStore.replaceLessons([]);
    this.messageService.displaySuccess('Les données ont bien été supprimées.');
  }

  validateExempleImport() {
    const dialogRef = this.dialog.open<boolean>(ConfirmationDialog, {
      panelClass: 'dialog',
      data: {
        text: "Souhaitez-vous Importer les données d'exemple ? Les données actuelles seront supprimées.",
      },
    });

    dialogRef.closed
      .pipe(
        tap((result) => {
          if (!!result) {
            this.importSettings(exempleJson as SettingsModel);
          }
        }),
      )
      .subscribe();
  }
}

class SettingsModel {
  constructor(
    public families: Family[],
    public volunteers: VolunteerMember[],
    public lessons: Lesson[],
    public version: string,
  ) {}
}
