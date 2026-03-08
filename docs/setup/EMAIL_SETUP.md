# 📧 Guia de Email - Password Reset

## 🚀 Como Funciona

O sistema agora:
1. **Envia email de verdade** com um template profissional
2. **Em desenvolvimento**: usa Ethereal (serviço gratuito de teste de email)
3. **Em produção**: usa teu SMTP configurado

## 🧪 Testar Localmente (Modo Desenvolvimento)

### Opção 1: Usar Ethereal automaticamente (Recomendado)

Sem nenhuma configuração, o sistema vai:
1. Criar uma conta Ethereal automática na primeira utilização
2. Enviar o email de teste
3. Exibir um link para visualizar o email no navegador

```bash
npm run dev
```

Depois:
1. Vai a `http://localhost:3000/auth/forgot-password`
2. Insere o email de um utilizador
3. Verifica o console do servidor pela mensagem: `📧 Email enviado! URL de pré-visualização: ...`
4. Clica no link para ver o email formatado

### Opção 2: Usar SendGrid, Twilio SendGrid, ou outro SMTP

Adiciona ao `.env.local`:

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=seu_sendgrid_api_key
SMTP_FROM=noreply@seudominio.com
SMTP_SECURE=false
```

**Ou Gmail:**

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu_email@gmail.com
SMTP_PASS=sua_senha_app_especifica
SMTP_FROM=seu_email@gmail.com
SMTP_SECURE=false
```

## 🧬 Endpoints Disponíveis

### 1. Solicitar Reset (Público)
```bash
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "usuario@exemplo.pt"
}
```

**Resposta**: Email enviado com link de reset

### 2. Validar Token (Público)
```bash
POST /api/auth/validate-reset-token
Content-Type: application/json

{
  "token": "abc123..."
}
```

### 3. Repor Palavra-passe (Público)
```bash
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "abc123...",
  "password": "NovaPassword123"
}
```

### 4. Testar Email (Desenvolvimento apenas)
```bash
POST /api/auth/test-email
Content-Type: application/json

{
  "email": "seu_email@exemplo.pt"
}
```

## 📋 Fluxo Completo

1. **Utilizador clica "Esqueceu a palavra-passe?"**
   - Vai a `/auth/forgot-password`

2. **Insere seu email**
   - POST para `/api/auth/forgot-password`
   - Recebe um email com link de reset (válido 24h)

3. **Clica no link do email**
   - Vai para `/auth/reset-password?token=xyz`
   - Token é validado

4. **Insere nova palavra-passe**
   - POST para `/api/auth/reset-password`
   - Palavra-passe é atualizada
   - Redireciona para login

## 🎨 Personalizações

### Alterar o template de email

Edita `src/lib/email.ts` - função `sendResetPasswordEmail()`
- Muda cores, logos, textos
- Adiciona teus dados de contacto

### Alterar duração do token (24h atualmente)

Em `src/app/api/auth/forgot-password/route.ts`:
```typescript
const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas
```

## ⚙️ Variáveis de Ambiente Necessárias

```env
# Required em produção
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=noreply@pawlyx.pt

# Optional - será criado automaticamente em dev
SMTP_SECURE=false

# Already configured
NEXTAUTH_URL=
DATABASE_URL=
NEXTAUTH_SECRET=
```

## 🐛 Troubleshooting

### "Email não foi enviado"
1. Verifica `.env.local` tem SMTP configurado
2. Verifica console: `npm run dev` deve mostrar logs de email
3. Em Ethereal, verifica o link de pré-visualização

### "Token inválido"
- Token tem 32 caracteres aleatórios
- É válido por 24 horas
- Depois de usar, é apagado

### "Palavra-passe não muda"
- Verifica se a nova senha cumpre requisitos:
  - Mínimo 8 caracteres
  - Tem maiúsculas, minúsculas, números

## 📚 Próximos Passos

1. Testa localmente com Ethereal
2. Configura SMTP real (SendGrid, Gmail, etc.)
3. Personaliza o template de email
4. Deploy em produção
5. (Opcional) Adiciona SMS com Twilio
