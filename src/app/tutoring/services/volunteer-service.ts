import { inject, Service } from '@angular/core';
import { map, Observable, of, switchMap } from 'rxjs';
import { Address } from '../../shared/models/address';
import { DateService } from '../../shared/services/date-service';
import { GoogleSheetService } from '../../shared/services/google-sheet-service';
import { VolunteerMember } from '../models/volunteer-member';
import { SettingsStore } from '../stores/settings-store';
import { VolunteerStore } from '../stores/volunteer-store';

@Service()
export class VolunteerService {
  private readonly volunteerStore = inject(VolunteerStore);
  private readonly googleSheetService = inject(GoogleSheetService);
  private readonly settingStore = inject(SettingsStore);
  private readonly dateService = inject(DateService);

  addVolunteerSheet$(sheetName: string, title?: string): Observable<boolean> {
    const spreadsheetId = this.settingStore.settings().spreadsheetId;
    if (!spreadsheetId) {
      throw new Error('Création impossible, pas de fichier saisi');
    }
    const date = this.dateService.formatDate(new Date(), 'yyyy-MM-dd h:mm:ss') || '';
    return this.googleSheetService.addSheet$(spreadsheetId, sheetName).pipe(
      switchMap(() => {
        return this.googleSheetService.writeCell(spreadsheetId, sheetName, 'G1', date);
      }),
      switchMap(() => {
        if (!!title) {
          return this.googleSheetService.writeCell(spreadsheetId, sheetName, 'C4', title);
        } else {
          return of(true);
        }
      }),
      switchMap(() => {
        return this.googleSheetService.writeCell(spreadsheetId, sheetName, 'A6', 'BÉNÉVOLES');
      }),
      switchMap(() => {
        const values = [this.volunteerHeader(), ...this.volunteersData()];
        return this.googleSheetService.writeCells(spreadsheetId, sheetName, 'A7', values);
      }),
      map(() => true),
    );
  }

  private volunteerHeader(): string[] {
    return ['Nom', 'Prénom', 'Adresse', "Complément d'adresse", 'CP - Ville', 'Mail', 'Téléphone'];
  }

  private volunteersData(): string[][] {
    return this.volunteerStore.volunteers().map((v) => this.volunteerData(v));
  }

  private volunteerData(volunteer: VolunteerMember): string[] {
    const data: string[] = [];
    data.push(volunteer.lastName);
    data.push(volunteer.firstName);
    data.push(volunteer.address?.street || '');
    data.push(volunteer.address?.additional || '');
    data.push(this.addressCodeCity(volunteer.address));
    data.push(volunteer.email || '');
    data.push(volunteer.phoneNumbers.join(', '));
    return data;
  }

  private addressCodeCity(address: Address | undefined): string {
    return [address?.postCode, address?.city].filter((data) => !!data).join(' - ');
  }
}
