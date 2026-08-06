import { Component, signal, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { PoPageLogin, PoPageLoginLiterals, PoPageLoginModule } from '@po-ui/ng-templates';
import { AuthService } from '../../services/auth.service';
import { NfseService } from '../../services/nfse.service';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  standalone: true,
  imports: [PoPageLoginModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class LoginFormComponent {
  carregando = signal(false);
  loginErrors: string[] = [];
  passwordErrors: string[] = [];

  readonly literals: PoPageLoginLiterals = {
    welcome: 'Boas-vindas',
    loginPlaceholder: 'Digite seu e-mail',
    loginLabel: 'E-mail',
    loginHint: 'Caso não possua usuário entre em contato com o suporte',
    passwordPlaceholder: 'Digite sua senha',
    passwordLabel: 'Senha',
    loginErrorPattern: 'Informe um e-mail válido',
    passwordErrorPattern: 'Informe sua senha',
    submitLabel: 'Entrar',
    submittedLabel: 'Autenticando...',
    rememberUser: 'Lembrar usuário'
  };

  constructor(
    private auth: AuthService,
    private nfseService: NfseService,
    private router: Router
  ) {}

  entrar(dados: PoPageLogin) {
    this.carregando.set(true);
    this.loginErrors = [];
    this.passwordErrors = [];
    this.auth.autenticar(dados.login, dados.password).subscribe({
      next: () => {
        this.nfseService.autenticarAcbr().subscribe({
          next: (res: any) => {
            this.nfseService.setTokenAcbr(res.access_token);
            this.carregando.set(false);
            this.router.navigate(['/']);
          },
          error: (err: any) => {
            this.carregando.set(false);
            this.loginErrors = ['Usuário autenticado, mas falha ao configurar o serviço NFS-e.'];
            console.error(err);
          }
        });
      },
      error: (error: any) => {
        this.carregando.set(false);
        const msg = error.error?.message || error.statusText || 'Falha na autenticação';
        this.loginErrors = [msg];
        this.passwordErrors = [];
      }
    });
  }
}
