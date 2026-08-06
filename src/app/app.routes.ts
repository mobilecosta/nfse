import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { NfseFormComponent } from './components/nfse-form/nfse-form.component';
import { CertificadoFormComponent } from './components/certificado-form/certificado-form.component';
import { LoginFormComponent } from './components/login-form/login-form.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginFormComponent },
  { path: '', component: HomeComponent, pathMatch: 'full', canActivate: [AuthGuard] },
  { path: 'emissao', component: NfseFormComponent, canActivate: [AuthGuard] },
  { path: 'certificado', component: CertificadoFormComponent, canActivate: [AuthGuard] }
];
