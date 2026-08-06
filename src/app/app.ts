import { Component, signal, computed } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { PoModule, PoToolbarAction, PoToolbarProfile, PoMenuItem } from '@po-ui/ng-components';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, PoModule],
  template: `
    @if (auth.autenticado) {
      <div class="po-wrapper">
        <po-toolbar [p-title]="'Sistema de Emissão de NFS-e'" [p-profile]="perfil()" [p-profile-actions]="acoesToolbar"></po-toolbar>
        <po-menu [p-menus]="menus()" [p-collapsed]="menuColapsado()"></po-menu>
        <router-outlet></router-outlet>
      </div>
    } @else {
      <router-outlet></router-outlet>
    }
  `
})
export class App {
  protected readonly title = signal('nfse');
  protected readonly menuColapsado = signal(false);

  protected readonly menus = computed<PoMenuItem[]>(() => [
    { label: 'Início', shortLabel: 'Início', icon: 'an-house', link: '/' },
    { label: 'Emissão de NFS-e', shortLabel: 'NFS-e', icon: 'an-file-doc', link: '/emissao' },
    { label: 'Certificado Digital', shortLabel: 'Certificado', icon: 'an-identification-card', link: '/certificado' },
    this.menuColapsado()
      ? { label: 'Expandir Menu', shortLabel: 'Menu', icon: 'an-text-outdent', action: () => this.alternarMenu() }
      : { label: 'Recolher Menu', shortLabel: 'Menu', icon: 'an-text-indent', action: () => this.alternarMenu() }
  ]);

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

  alternarMenu() {
    this.menuColapsado.set(!this.menuColapsado());
  }
}
