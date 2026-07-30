import { Routes } from '@angular/router';
import { NfseFormComponent } from './components/nfse-form/nfse-form.component';

export const routes: Routes = [
  { path: '', component: NfseFormComponent, pathMatch: 'full' }
];
