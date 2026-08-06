import { Component, signal } from '@angular/core';
import { PoModule, PoLoadingModule } from '@po-ui/ng-components';
import { AuthService } from '../../services/auth.service';
import { NfseService } from '../../services/nfse.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
  imports: [PoModule, PoLoadingModule]
})
export class HomeComponent {
  carregando = signal(true);
  usuarios = signal(0);
  notas = signal(0);

  constructor(public auth: AuthService, private nfseService: NfseService) {
    this.carregarResumo();
  }

  private carregarResumo() {
    this.auth.listarUsuarios().subscribe({
      next: (res) => this.usuarios.set(res.count ?? 0),
      error: (error: any) => console.error('Erro ao carregar usuários:', error)
    });

    this.nfseService.garantirTokenAcbr().subscribe({
      next: () => this.carregarNotas(),
      error: (error: any) => {
        console.error('Erro ao obter token ACBr:', error);
        this.carregando.set(false);
      }
    });
  }

  private carregarNotas() {
    this.nfseService.listarNfse('66549275000197', 'homologacao', 1, 0).subscribe({
      next: (res: any) => {
        this.notas.set(res['@count'] ?? res.data?.length ?? 0);
        this.carregando.set(false);
      },
      error: (error: any) => {
        console.error('Erro ao carregar notas:', error);
        this.carregando.set(false);
      }
    });
  }
}
