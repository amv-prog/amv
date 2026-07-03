import { Dialog } from '@angular/cdk/dialog';
import { inject, Service } from '@angular/core';
import { InformationDialog } from '../components/information-dialog/information-dialog';

@Service()
export class MessageService {
  private readonly dialog = inject(Dialog);

  public displayError(text: string) {
    this.dialog.open<boolean>(InformationDialog, {
      panelClass: 'dialog',
      data: {
        title: 'Erreur !',
        text,
      },
    });
  }

  public displaySuccess(text: string) {
    this.dialog.open<boolean>(InformationDialog, {
      panelClass: 'dialog',
      data: {
        title: 'Succès !',
        text,
      },
    });
  }
}
