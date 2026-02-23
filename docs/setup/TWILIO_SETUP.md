# 📱 Twilio SMS Reminders Setup

## Visão Geral

A Pawlyx agora suporta lembretes automáticos por SMS via **Twilio** para marca de tosquia dentro de 24h.

## 🚀 Setup Twilio

### 1. Criar Conta Twilio

1. Ir para [twilio.com](https://www.twilio.com)
2. Clicar em "Sign Up" e criar conta
3. Confirmar email
4. Preencher o formulário de bem-vindo

### 2. Obter Credenciais

Após criar a conta, você terá:

- **Account SID**: Identificador único da conta
- **Auth Token**: Token de autenticação
- **Phone Number**: Número Twilio para enviar SMS

Você pode encontrar estes no [Twilio Console](https://console.twilio.com/):

![Twilio Console Overview]

### 3. Configurar .env.local

Adicione as seguintes variáveis ao seu arquivo `.env.local`:

```bash
# Twilio SMS Configuration
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890  # Seu número Twilio (formato E.164)

# CRON Secret (para chegar a /api/reminders)
CRON_SECRET=seu_secret_cron_seguro
```

**⚠️ IMPORTANTE: Nunca compartilhe TWILIO_AUTH_TOKEN ou coloque em produção sem usar secrets seguros!**

### 4. Formato de Números de Telefone

Os números de cliente devem estar em um destes formatos:

- ✅ `+351912345678` (E.164 completo)
- ✅ `912345678` (número local português)
- ✅ `00351912345678` (com código internacional)
- ⚠️ `91 234 5678` (espaços são removidos)
- ⚠️ `918-234-5678` (hífens são removidos)

O sistema formata automaticamente para E.164.

## 📊 Como Funciona

### Flow de Lembretes

```
1. Cliente cria appointment às 14:00 para amanhã às 10:00
   ↓
2. Sistema cria 2 reminders especialmente:
   - EMAIL reminder (24h antes)
   - SMS reminder (24h antes) ← Se has número de telefone
   ↓
3. CRON executa GET /api/reminders a cada X minutos
   ↓
4. Se reminder.status === 'pending' e scheduledFor <= agora:
   - Se channel === 'sms': envia via Twilio ✅
   - Se channel === 'email': envia via serviço email (TODO)
   ↓
5. Reminder marcado como 'sent' ou 'failed'
```

### Schema do Reminder

```typescript
model Reminder {
  id            String    @id @default(cuid())
  type          String    // "appointment_24h"
  channel       String    // "email" ou "sms"
  scheduledFor  DateTime  // Quando enviar
  sentAt        DateTime? // Quando foi enviado
  status        String    // "pending", "sent", "failed", "cancelled"
  error         String?   // Mensagem de erro se falhou
  appointmentId String?
  createdAt     DateTime
}
```

## 🔧 Verificar Status

### Logs no Dashboard

Cada envio de SMS é logado. Você pode verificar:

1. **Terminal/Logs do servidor** - Verá `✅ SMS enviado:`
2. **Banco de dados** - Verificar tabela `Reminder`:
   ```sql
   SELECT id, appointmentId, channel, status, sentAt, error 
   FROM Reminder 
   WHERE type = 'appointment_24h' AND channel = 'sms'
   ORDER BY createdAt DESC;
   ```

### Testar Manualmente

```bash
# Chamar endpoint de reminders
curl -X GET http://localhost:3001/api/reminders/send \
  -H "Authorization: Bearer seu_cron_secret"
```

### Exemplo de Resposta

```json
{
  "message": "Reminders processed",
  "processed": 2,
  "sent": 1,
  "failed": 1,
  "errors": [
    "Reminder xyz: Client has no phone number"
  ]
}
```

## 📲 Exemplo de Mensagem SMS

```
Olá João! 🐾 Lembrete: tem tosquia para Doggo amanhã às 10:30. 
Serviço: Tosquia Completa. Até breve!
```

## 🛠️ Troubleshoot

### SMS não é enviado

**Problema**: Reminder criado mas SMS não enviado

**Soluções**:
1. Verificar se `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` estão corretos
2. Verificar se cliente tem número de telefone
3. Verificar formato do número (deve ser E.164)
4. Verificar se conta Twilio tem créditos
5. Chamar `/api/reminders` manualmente e verificar erro

### Erro: "Twilio não configurado"

**Solução**: Verificar se variáveis de ambiente foram adicionadas a `.env.local`. 
Se em produção, usar gerenciador de secrets (Vercel, Railway, etc).

### "Número de telefone inválido"

**Solução**: Certificar-se de que o número está em formato E.164 ou português válido.

```javascript
// Exemplos que funcionam:
"+351912345678"  ✅
"912345678"      ✅ (será convertido para +351912345678)

// Exemplos que NÃO funcionam:
"91 234 5678"    ❌ (salve sem espaços)
"0912345678"     ❌ (deve ser 912345678)
```

## 🔐 Segurança

1. **Auth Token**: Nunca commitar para Git. Usar `.gitignore`
2. **CRON Secret**: Deve ser único e complexo
3. **Dados Pessoais**: Números de telefone são dados sensíveis
4. **Rate Limiting**: Twilio tem limites de taxa - contacte-os para aumentar

## 💰 Custos Twilio

- **Conta Trial**: Grátis para testar (números limitados)
- **SMS**: ~$0.0075 por SMS enviado (varia por país)
- **Portugal**: Verifique preços atualizados em [Twilio Pricing](https://www.twilio.com/en-us/sms/pricing)

## 📞 Suporte

- Documentação Twilio: https://www.twilio.com/docs
- Status da API: https://status.twilio.com
- Suporte: https://support.twilio.com

## Próximos Passos

- [ ] Configurar serviço de email (Resend, SendGrid, etc)
- [ ] Adicionar UI para preferências de reminder (email vs SMS)
- [ ] Implementar unsubscribe links
- [ ] Adicionar twilio-nodejs SDK para melhor tipo checking
- [ ] Implementar retry automático para SMS falhados
