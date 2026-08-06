import { Routes } from '@angular/router';
import { NfseFormComponent } from './components/nfse-form/nfse-form.component';
import { CertificadoFormComponent } from './components/certificado-form/certificado-form.component';

export const routes: Routes = [
  { path: '', component: NfseFormComponent, pathMatch: 'full' },
  { path: 'certificado', component: CertificadoFormComponent }
];
