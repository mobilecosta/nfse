import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PoModule } from '@po-ui/ng-components';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, PoModule],
  template: `
    <po-page p-title="Sistema de Emissão de NFS-e">
      <router-outlet></router-outlet>
    </po-page>
  `,
  styles: [':host { display: block; height: 100%; }']
})
export class App {
  protected readonly title = signal('nfse');
}
