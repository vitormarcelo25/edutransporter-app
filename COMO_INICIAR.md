# EduTransporter - Como Iniciar

## No Dia do Pitch (PC novo)

### Passo 1: Clonar e instalar
```powershell
git clone https://github.com/vitormarcelo25/edutransporter-app.git
cd edutransporter-app
npm install
```

### Passo 2: Iniciar o Frontend
**Duplo-clique em `pitch.bat`** — ele inicia o Expo e abre o app no navegador.

Se o duplo-clique não funcionar (abrir no Notepad), abra o PowerShell na pasta do projeto e digite:
```powershell
.\pitch.bat
```

### Passo 3: Abrir o app
Abra o navegador em **http://localhost:8081**

### Credenciais de teste
- **CPF:** `71409312060`
- **Senha:** `123456`

---

## Bibliotecas necessárias no PC
- Node.js (https://nodejs.org)
- Git

---

## Arquitetura Atual

| Componente | Status | Observação |
|---|---|---|
| Frontend (Expo) | Obrigatório | Roda na porta 8081 |
| `services/api.ts` | Mock | Dados fictícios para todas as funções |
| Backend (nuvem) | Futuro | Substituir mocks por chamadas reais |

### Funcionalidades mock (funcionam sem backend)
- Login, Registro, Presença
- Rota do dia, Histórico, Avisos
- Perfil, Agenda, Notificações, Senha
- Admin, Feriados, Convites

---

## Para Mostrar no Celular
No PowerShell:
```powershell
npx expo start --tunnel
```
Escaneie o QR code com o Expo Go.

---

## Migração para Nuvem (futuro)

Quando tiver um backend na nuvem:

### 1. Ativar a URL da API
No arquivo `services/api.ts`, descomente e altere:
```typescript
const API_BASE_URL = 'https://SUA_URL_AQUI/api';
```

### 2. Substituir mocks por chamadas reais
No mesmo arquivo, substitua cada função mock por uma chamada `fetch` à API.

### 3. Testar
Verificar se login, presença e demais funções funcionam com a nova URL.

---

## Resumo Rápido

- **No pitch day**: Apenas `git pull` + `.\pitch.bat` → abre `http://localhost:8081`
- **Para nuvem**: Ativar URL no `api.ts` + substituir mocks + deploy
- **Todas as funcionalidades** usam dados mock (sem dependência de backend)
