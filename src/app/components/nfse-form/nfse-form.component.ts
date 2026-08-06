import { Component, signal, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { PoPageAction } from '@po-ui/ng-components';
import { NfseService } from '../../services/nfse.service';

@Component({
  selector: 'app-nfse-form',
  templateUrl: './nfse-form.component.html',
  styleUrls: ['./nfse-form.component.css'],
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class NfseFormComponent {
  nfseForm: FormGroup;
  carregando = signal(false);
  
  constructor(
    private fb: FormBuilder,
    private nfseService: NfseService
  ) {
    this.nfseForm = this.fb.group({
      prestadorCpfCnpj: ['66549275000197', [Validators.required]],
      prestadorNome: ['', Validators.required],
      prestadorEmail: [''],
      prestadorTelefone: [''],
      tomadorCpfCnpj: ['', [Validators.required]],
      tomadorNome: ['', Validators.required],
      tomadorCep: [''],
      tomadorLogradouro: [''],
      tomadorNumero: [''],
      tomadorBairro: [''],
      tomadorCidade: [''],
      tomadorUf: [''],
      servicoCodigoCnae: [''],
      servicoDescricao: ['', Validators.required],
      servicoQuantidade: [1],
      servicoValorUnitario: [0],
      servicoAliquotaIss: [0]
    });
  }

  get f() { return this.nfseForm.controls; }

  emitirNfse() {
    if (this.nfseForm.invalid) {
      this.nfseForm.markAllAsTouched();
      return;
    }
    this.carregando.set(true);
    const form = this.nfseForm.value;
    const body = {
      provedor: 'padrao',
      ambiente: 'homologacao',
      referencia: `NFS-${Date.now()}`,
      infDPS: {
        prest: {
          CPF: form.prestadorCpfCnpj.length <= 11 ? form.prestadorCpfCnpj : undefined,
          CNPJ: form.prestadorCpfCnpj.length > 11 ? form.prestadorCpfCnpj : undefined
        },
        toma: {
          xNome: form.tomadorNome,
          end: {
            endNac: { cMun: '3550308', CEP: form.tomadorCep },
            xLgr: form.tomadorLogradouro,
            nro: form.tomadorNumero,
            xBairro: form.tomadorBairro
          }
        },
        serv: {
          cServ: { CNAE: form.servicoCodigoCnae, xDescServ: form.servicoDescricao }
        },
        valores: {
          vServPrest: { vServ: form.servicoQuantidade * form.servicoValorUnitario },
          trib: {
            tribMun: {
              tribISSQN: 1,
              pAliq: form.servicoAliquotaIss || 0,
              vISSQN: +(form.servicoQuantidade * form.servicoValorUnitario * (form.servicoAliquotaIss || 0) / 100).toFixed(2),
              cLocIncid: '3550308'
            }
          }
        }
      }
    };
    this.nfseService.emitirNfse(body).subscribe({
      next: (response: any) => {
        this.carregando.set(false);
        alert('NFS-e emitida! ID: ' + response.id);
      },
      error: (error: any) => {
        this.carregando.set(false);
        alert('Erro: ' + (error.error?.message || error.statusText));
      }
    });
  }

  consultarCep() {
    const cep = this.f['tomadorCep'].value;
    if (cep && cep.length >= 8) {
      fetch(`https://viacep.com.br/ws/${cep}/json/`)
        .then(r => r.json())
        .then(data => {
          if (!data.erro) {
            this.nfseForm.patchValue({
              tomadorLogradouro: data.logradouro,
              tomadorBairro: data.bairro,
              tomadorCidade: data.localidade,
              tomadorUf: data.uf
            });
          }
        });
    }
  }

  acoesPrincipais(): PoPageAction[] {
    return [{ label: 'Emitir NFS-e', icon: 'po-icon-ok', action: () => this.emitirNfse() }];
  }

  acoesSecundarias(): PoPageAction[] {
    return [{ label: 'Cancelar', icon: 'po-icon-delete' }];
  }
}
