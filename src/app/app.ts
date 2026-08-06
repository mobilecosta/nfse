import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { PoModule } from '@po-ui/ng-components';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, PoModule],
  template: `
    <po-toolbar [p-title]="'Sistema de Emissão de NFS-e'"></po-toolbar>
    <po-menu [p-menus]="menus"></po-menu>
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
}
