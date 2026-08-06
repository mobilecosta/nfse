import { Component, signal, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.css'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class LoginFormComponent {
  loginForm: FormGroup;
  carregando = signal(false);
  erro = signal('');

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      clientId: ['', Validators.required],
      clientSecret: ['', Validators.required]
    });
  }

  get f() { return this.loginForm.controls; }

  entrar() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.carregando.set(true);
    this.erro.set('');
    const { clientId, clientSecret } = this.loginForm.value;
    this.auth.autenticar(clientId, clientSecret).subscribe({
      next: () => {
        this.carregando.set(false);
        this.router.navigate(['/']);
      },
      error: (error: any) => {
        this.carregando.set(false);
        this.erro.set('Falha na autenticação: ' + (error.error?.error_description || error.error?.error || error.statusText));
      }
    });
  }
}
