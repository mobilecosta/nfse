import { Routes } from '@angular/router';
import { NfseFormComponent } from './components/nfse-form/nfse-form.component';
import { CertificadoFormComponent } from './components/certificado-form/certificado-form.component';
import { LoginFormComponent } from './components/login-form/login-form.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginFormComponent },
  { path: '', component: NfseFormComponent, pathMatch: 'full', canActivate: [AuthGuard] },
  { path: 'certificado', component: CertificadoFormComponent, canActivate: [AuthGuard] }
];
