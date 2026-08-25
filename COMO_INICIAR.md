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

## Para Conectar na Nuvem (futuro)

Quando for conectar o frontend a um backend na nuvem, siga estes passos:

### 1. Alterar a URL da API
No arquivo `services/api.ts`, linha 15, mude:
```typescript
const API_BASE_URL = 'http://localhost:8080/api';
//para:
const API_BASE_URL = 'https://SUA_URL_AQUI/api';
//Exemplo: const API_BASE_URL = 'https://edutransporter.vercel.app/api';
```

### 2. Definir o modo de conexão
No mesmo arquivo, a constante `USE_MOCK` controla o comportamento:
- `USE_MOCK = false` (padrão): O app tenta conectar na `API_BASE_URL`
- `USE_MOCK = true`: O app usa dados fictícios (mock) para todas as funções

### 2. Bibliotecas necessárias no PC
- Node.js (https://nodejs.org)
- Git
- (Opcional) Java 21 e Docker — **só necessários se quiser rodar o backend localmente**
- (Opcional) Expo CLI (`npx expo start`)

### 3. O que roda no pitch day
- Apenas o frontend (Expo) é iniciado automaticamente pelo `pitch.bat`
- O backend (Java + MySQL) pode ser localizado ou na nuvem
- Se o backend local não for iniciado, as funcionalidades **mock** funcionam:
  - Rota do dia, histórico, avisos, perfil, agenda, notificações, senha
- As funcionalidades **reais** (login, registro, presença) só funcionam se o backend Java + MySQL estiverem rodando

### 3. Para mostrar no celular
No PowerShell:
```powershell
npx expo start --tunnel
```
Escaneie o QR code com o Expo Go.

---

## Arquitetura Atual

| Componente | Status | Observação |
|---|---|---|
| `services/api.ts` | Híbrido | URL configurável + flag USE_MOCK |
| Java Backend (local) | Opcional | Roda na porta 8080 (pitch.bat inicia se achar Java) |
| MySQL (local) | Opcional | Porta 3306 (pitch.bat inicia container se necessário) |
| Frontend (Expo) | Obrigatório | Sempre roda na porta 8081 |
| Funcionalidades Reais | Login, Registro, Presença | Só funcionam com backend local/ativo |
| Funcionalidades Mock | GPS, Avisos, Agenda, Admin, Perfil, Notificações | Funcionam mesmo sem backend |

---

## Migração para Produção (nuvem)

1. **Deploy do frontend**: Publicar o app Expo na Vercel, Netlify ou EAS
2. **Backend na nuvem**: Criar API REST em Node.js, Python, Ruby on Rails, etc.
3. **Atualizar `api.ts`**: Substituir `localhost:8080` pela URL da API da nuvem
4. **Testar**: Verificar se login, presença e demais funções funcionam com a nova URL

---

## Resumo Rápido

- **No pitch day**: Apenas `git pull` + `.\pitch.bat` → abre `http://localhost:8081`
- **Para nuvem**: Mudar URL no `api.ts` + deploy do frontend
- **Funcionalidades mock** funcionam sem backend
- **Funcionalidades reais** (login/presença) precisam do backend Java + MySQL ou substituição na nuvem