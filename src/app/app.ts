import { Component, signal } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { PoModule, PoToolbarAction } from '@po-ui/ng-components';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, PoModule],
  template: `
    @if (auth.autenticado) {
      <po-toolbar [p-title]="'Sistema de Emissão de NFS-e'" [p-actions]="acoesToolbar" p-actions-icon="po-icon-user"></po-toolbar>
      <po-menu [p-menus]="menus"></po-menu>
    }
    <div class="conteudo">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [':host { display: block; height: 100%; }', '.conteudo { padding: 1rem; }']
})
export class App {
  protected readonly title = signal('nfse');
  protected readonly menus = [
    { label: 'Emissão de NFS-e', link: '/' },
    { label: 'Certificado Digital', link: '/certificado' }
  ];

  protected readonly acoesToolbar: PoToolbarAction[] = [
    { label: 'Sair', icon: 'po-icon-exit', action: () => this.sair() }
  ];

  constructor(public auth: AuthService, private router: Router) {}

  sair() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
