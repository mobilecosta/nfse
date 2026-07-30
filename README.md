# Sistema de Emissão de NFS-e

Aplicação Angular para emissão de Nota Fiscal de Serviços Eletrônica (NFS-e) integrada com a ACBr API.

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

## 🔌 API ACBr

Documentação: https://dev.acbr.api.br/docs/nfse

Endpoints utilizados:
- `POST /nfse/dps` - Emitir NFS-e
- `GET /nfse` - Listar NFS-e
- `GET /nfse/{id}` - Consultar NFS-e
- `POST /nfse/{id}/cancelamento` - Cancelar NFS-e
- `GET /nfse/cidades` - Cidades atendidas

## 🛠️ Desenvolvimento

```bash
npm install
npm start
```

Acesse: http://localhost:4200
