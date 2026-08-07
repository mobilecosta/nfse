# Sistema de Emissão de NFS-e

Aplicação Angular para emissão de Nota Fiscal de Serviços Eletrônica (NFS-e) integrada com a ACBr API.

## ✨ Funcionalidades

- **Autenticação**: login com e-mail/senha, sessão persistida via `localStorage`, logout no perfil.
- **Menu lateral**: recolher/expandir, navegação entre páginas (Início, Emissão, Certificado).
- **Home**: cards de resumo das notas emitidas.
- **Emissão de NFS-e**:
  - Listagem paginada (10 itens por página, navegação Anterior/Próxima) com botões Visualizar e Excluir.
  - Formulário em abas (Obrigatórios, Prestador, Tomador, Serviço, Valores) com campos obrigatórios marcados e validação que ativa a aba do primeiro erro.
  - Busca de endereço via CEP (ViaCEP) para o tomador.
  - Modal em tamanho `xl` para melhor aproveitamento da tela.
  - Emissão no ambiente de homologação, no padrão DPS nacional.
- **Certificado digital**: consulta de CPF/CNPJ, upload/expiração de certificado, configuração de Série RPS, Lote e Número.
- **Cancelamento** de NFS-e com motivo.

## 🚀 Deploy na Vercel

### Opção 1: Via GitHub (Recomendado)

1. Acesse https://vercel.com/new
2. Importe o repositório `mobilecosta/nfse`
3. A Vercel detectará automaticamente o projeto Angular
4. Clique em **Deploy**

### Opção 2: Via CLI

```bash
npm install -g vercel
vercel login
vercel --prod
```

## 📋 Pré-requisitos

- Node.js 22.x ou superior
- npm 10.x ou superior
- Conta na ACBr API (https://www.acbr.api.br)

## ⚙️ Instalação

```bash
npm install
npm start
```

Acesse: http://localhost:4200

## 🛠️ Scripts

| Script  | Descrição                       |
|---------|---------------------------------|
| `start` | Servidor de desenvolvimento     |
| `build` | Build de produção               |
| `watch` | Build de desenvolvimento        |

## 🧱 Stack

- Angular 21
- PO UI 21.27 (`@po-ui/ng-components`, `@po-ui/ng-templates`, `@po-ui/style`)
- Tema THF (Totvs) (`@totvs/po-theme`)
- TypeScript 5.9

## 📁 Estrutura

```
src/app/
├── components/
│   ├── login/                  # Tela de login
│   ├── home/                   # Página inicial com resumo
│   ├── nfse-form/              # Listagem e formulário de emissão em abas
│   ├── certificado-form/       # Gestão de certificado digital
│   └── layout/                 # Menu lateral e rodapé
├── services/
│   ├── auth.service.ts         # Autenticação (chave: acbr_auth_state)
│   └── nfse.service.ts         # Comunicação com a ACBr API
└── app.ts                      # Configuração do menu
```

## 🔌 API ACBr

Documentação: https://dev.acbr.api.br/docs/nfse

A comunicação é feita através do proxy `https://finance-backend-mobile.vercel.app/api/acbr`, que adiciona os cabeçalhos CORS necessários (o `auth.acbr.api.br` não envia `Access-Control-Allow-Origin` no preflight, bloqueando o navegador).

Credenciais `client_id`/`client_secret` e a URL do proxy são configuradas em `src/app/services/nfse.service.ts`. O token obtido em `POST /auth` é reaproveitado nas chamadas seguintes.

Endpoints utilizados (via proxy):

- `POST /auth` - Autenticação (client_id/client_secret)
- `POST /nfse/dps` - Emitir NFS-e (DPS nacional)
- `GET /nfse?$top=$skip` - Listar NFS-e paginada
- `GET /nfse/{id}` - Consultar NFS-e
- `POST /nfse/{id}/cancelamento` - Cancelar NFS-e
- `GET /nfse/cidades` - Cidades atendidas

## 📄 Notas

- A emissão é enviada no padrão DPS (`infDPS`) com os grupos: `prest`, `toma`, `interm`, `serv` e `valores`.
- As notas listadas trazem o formato `{ "@count", data: [{ id, status, ambiente, referencia, DPS: { serie, nDPS }, mensagens }] }`.
