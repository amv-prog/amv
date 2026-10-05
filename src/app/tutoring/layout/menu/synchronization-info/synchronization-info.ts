import { Component, inject } from '@angular/core';
import { AuthenticationService } from '../../../../shared/services/authentication-service';
import { DataService } from '../../../services/data-service';
import { SettingsStore } from '../../../stores/settings-store';

@Component({
  selector: 'amv-synchronization-info',
  imports: [],
  templateUrl: './synchronization-info.html',
})
export class SynchronizationInfo {
  private readonly authenticationService = inject(AuthenticationService);
  private readonly settingsStore = inject(SettingsStore);
  private readonly dataService = inject(DataService);

  protected readonly googleUser = this.authenticationService.googleUser;
  protected readonly settings = this.settingsStore.settings;
  protected readonly dataErrors = this.dataService.getLoadingErrors();
}
