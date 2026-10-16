import { Component, inject } from '@angular/core';
import { DataService } from '../../../services/data-service';
import { SettingsStore } from '../../../stores/settings-store';

@Component({
  selector: 'amv-synchronization-info',
  imports: [],
  templateUrl: './synchronization-info.html',
})
export class SynchronizationInfo {
  private readonly settingsStore = inject(SettingsStore);
  private readonly dataService = inject(DataService);

  protected readonly settings = this.settingsStore.settings;
  protected readonly dataErrors = this.dataService.getLoadingErrors();
  protected readonly spreadsheetName = this.dataService.spreadsheetName;
}
