import { Component, signal, computed } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { PoModule, PoToolbarAction, PoToolbarProfile } from '@po-ui/ng-components';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, PoModule],
  template: `
    @if (auth.autenticado) {
      <div class="po-wrapper">
        <po-toolbar [p-title]="'Sistema de Emissão de NFS-e'" [p-profile]="perfil()" [p-profile-actions]="acoesToolbar"></po-toolbar>
        <po-menu [p-menus]="menus"></po-menu>
        <router-outlet></router-outlet>
      </div>
    } @else {
      <router-outlet></router-outlet>
    }
  `
})
export class App {
  protected readonly title = signal('nfse');
  protected readonly menus = [
    { label: 'Início', link: '/' },
    { label: 'Emissão de NFS-e', link: '/emissao' },
    { label: 'Certificado Digital', link: '/certificado' }
  ];

  protected readonly acoesToolbar: PoToolbarAction[] = [
    { label: 'Sair', icon: 'an-sign-out', action: () => this.sair() }
  ];

  protected readonly perfil = computed<PoToolbarProfile>(() => ({
    avatar: this.auth.user?.name?.charAt(0) ?? '',
    title: this.auth.user?.name || this.auth.user?.email || '',
    subtitle: this.auth.user?.email ?? ''
  }));

  constructor(public auth: AuthService, private router: Router) {}

  sair() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
