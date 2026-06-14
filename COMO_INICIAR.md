# EduTransporter - Como Iniciar o Projeto

## Requisitos
- Java 21 (`C:\Program Files\Java\jdk-21`)
- Docker Desktop
- Node.js
- Expo CLI (`npx expo`)

## 1. Banco de Dados (MySQL)
```powershell
docker start mysql-node
```
- Host: `localhost:3306`
- Banco: `edutransporte`
- Usuário: `edu` / Senha: `edu123`

## 2. Backend Java (Spring Boot)
```powershell
cd C:\Users\vitorsantana\edutransporte\API-OFC
$env:JAVA_HOME = "C:\Program Files\Java\jdk-21"
.\mvnw.cmd spring-boot:run
```
Ou duplo-clique em `C:\Users\vitorsantana\edutransporte\iniciar-backend.bat`

- Porta: `8080`
- URL: `http://localhost:8080/api`

### Endpoints Java:
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/aluno/login` | Login aluno (cpf, senha) → boolean |
| POST | `/api/aluno/cadastrar` | Cadastro aluno |
| DELETE | `/api/aluno/deletar/{cpf}` | Deletar aluno |
| POST | `/api/motorista/login` | Login motorista |
| POST | `/api/motorista/cadastrar` | Cadastro motorista |
| POST | `/api/presenca/marcar` | Confirmar presença |
| DELETE | `/api/presenca/desmarcar/{id}` | Cancelar presença |
| POST | `/api/viagem/criar` | Criar viagem |
| POST | `/api/cidade/cadastrar` | Cadastrar cidade |
| POST | `/api/faculdade/cadastrar` | Cadastrar faculdade |
| POST | `/api/veiculo/cadastrar` | Cadastrar veículo |
| POST | `/api/motorista-veiculo/atribuir` | Atribuir veículo ao motorista |

## 3. Frontend (Expo)
```powershell
cd C:\Users\vitorsantana\edutransporte
npx expo start
```
- Porta: `8081`

## Usuário de teste
- CPF: `71409312060`
- Senha: `123456`

## phpMyAdmin (visual do banco)
```powershell
docker start phpmyadmin
```
- URL: `http://localhost:8082`
- Usuário: `edu` / Senha: `edu123`

## Correções aplicadas no Java
- `pom.xml`: Adicionado annotation processor do Lombok + versão explícita 1.18.36
- `DataConfiguration.java`: Corrigido banco (`edutransporte`), usuário (`edu`), dialect (`MySQLDialect`)
- `application.yaml`: `MySQL8Dialect` → `MySQLDialect`
- `SecurityConfig.java`: Adicionado CORS (`*`) + removido `WebSecurityCustomizer`

## Arquitetura
- `services/api.ts`: Camada híbrida Java + Mock fallback
- Java backend para: login, registro, presença
- Mock para: GPS, avisos, agenda, admin, perfil, rotas do dia

## Para testar no celular
Troque `localhost` pelo IP do PC no `services/api.ts` linha 13:
```typescript
const JAVA_BASE_URL = 'http://SEU_IP:8080/api';
```
Descubra o IP: `ipconfig | findstr IPv4`
Libere a porta: `netsh advfirewall firewall add rule name="JavaBackend" dir=in action=allow protocol=TCP localport=8080`
