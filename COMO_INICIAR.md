# EduTransporter - Como Iniciar

## No Dia do Pitch (PC novo)

### Passo 1: Clonar e instalar
```powershell
git clone https://github.com/vitormarcelo25/edutransporter-app.git
cd edutransporter-app
npm install
```

### Passo 2: Iniciar TUDO com um clique
**Duplo-clique em `pitch.bat`** — ele liga MySQL, Backend Java e Expo automaticamente.

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

## Requisitos no PC
- Java 21 (`C:\Program Files\Java\jdk-21`)
- Docker Desktop (rodando)
- Node.js
- Git

## O que o pitch.bat faz
1. Liga o MySQL Docker (porta 3306)
2. Abre o Backend Java (porta 8080)
3. Abre o Expo no navegador (porta 8081)

## Para mostrar no celular
No PowerShell:
```powershell
npx expo start --tunnel
```
Escaneie o QR code com o Expo Go.

---

## Endpoints Java
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/aluno/login` | Login aluno (cpf, senha) |
| POST | `/api/aluno/cadastrar` | Cadastro aluno |
| POST | `/api/motorista/login` | Login motorista |
| POST | `/api/motorista/cadastrar` | Cadastro motorista |
| POST | `/api/presenca/marcar` | Confirmar presença |
| DELETE | `/api/presenca/desmarcar/{id}` | Cancelar presença |

## Arquitetura
- `services/api.ts`: Camada híbrida Java + Mock fallback
- Java backend para: login, registro, presença
- Mock para: GPS, avisos, agenda, admin, perfil, rotas do dia
