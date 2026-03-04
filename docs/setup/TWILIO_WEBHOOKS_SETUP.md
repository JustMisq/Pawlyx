# 📱 Twilio SMS avec Webhooks (Tracking de Livraison)

## Configuration Complète

### 1️⃣ Sur Twilio Console (https://console.twilio.com/)

#### A) Créer le Messaging Service

```
1. Aller à Messaging → Services
2. "+ Create Messaging Service"
3. Remplir:
   - Name: "Pawlyx SMS Notifications"
   - Use case: "Transactional Notifications"
4. CREATE
5. Tu reçois: MGXXXXXXXXXXXXXXXXXXXXXXXX
   → Copie dans .env.local
```

#### B) Ajouter le Sender Pool

```
1. Dans ton Service créé, onglet "Sender Pool"
2. "+ Add Senders"
3. Sélectionne le numéro Twilio (celui que tu as déjà)
```

#### C) Configurer les Webhooks Outbound

```
1. Dans ton Service, onglet "Integration"
2. Sous "Outbound Settings":
   
   POST URL:
   https://tvb3-xx-xxx-xxx-xx.eu.ngrok.io/api/webhooks/twilio/sms-status
   
   (en production: https://ton-domain.com/api/webhooks/twilio/sms-status)
3. SAVE
```

---

### 2️⃣ Installer ngrok (pour tester en local)

```powershell
# Télécharger depuis https://ngrok.com/download
# Ou via chocolatey:
choco install ngrok

# Créer un compte gratuit sur https://ngrok.com/

# Configurer le token:
ngrok config add-authtoken YOUR_TOKEN_HERE

# Lancer ngrok (dans un nouveau terminal):
ngrok http 3000
```

Tu vas voir:
```
Forwarding                    https://tvb3-xx-xxx-xxx-xx.eu.ngrok.io -> http://localhost:3000
```

**Copie l'URL ngrok dans Twilio Console** ✅

---

### 3️⃣ Variables d'Environnement (.env.local)

```bash
# Twilio Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=axxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+33123456789              # Ton numéro Twilio
TWILIO_MESSAGING_SERVICE_SID=MGxxxxxxxxxx     # Nouveau!  

# Webhooks
TWILIO_WEBHOOK_URL=https://tvb3-xx-xxx-xxx-xx.eu.ngrok.io  # Local avec ngrok
# En production: https://ton-domain.com

# Sécurité
SKIP_TWILIO_SIGNATURE_VALIDATION=false        # true seulement en dev
CRON_SECRET=mon_secret_cron_super_secure_123
```

---

### 4️⃣ Test de Livraison

#### Via API SMS:
```bash
curl -X POST http://localhost:3000/api/sms/send \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "client123",
    "phoneNumber": "+33912345678",
    "message": "Test SMS",
    "type": "test"
  }'
```

#### Puis vérifier le statut:
```bash
curl http://localhost:3000/api/sms/logs
```

Tu vas voir:
```json
{
  "logs": [
    {
      "id": "...",
      "messageId": "SM123abc...",
      "toPhone": "+33912345678",
      "status": "delivered",  ← VOILÀ!
      "message": "Test SMS",
      "createdAt": "2026-03-04T10:30:00Z",
      "error": null
    }
  ],
  "stats": {
    "total": 1,
    "pending": 0,
    "sent": 0,
    "delivered": 1,
    "failed": 0
  }
}
```

---

### 5️⃣ Statuts de Livraison

| Status | Signification |
|--------|---|
| `pending` | En attente d'envoi |
| `sent` | Envoyé au réseau |
| `delivered` | Livré au téléphone ✅ |
| `failed` | Erreur (numéro invalide, etc) ❌ |

**Twilio met à jour automatiquement les statuts** via le webhook! 🚀

---

### 6️⃣ Dashboard

Dans l'interface Messages, tu vas voir:
- ✅ Liste des SMS envoyés
- ✅ Statut de chaque SMS (delivered, failed, etc)
- ✅ Remarques sur les erreurs
- ✅ Coûts et usage

---

## 🔧 Troubleshooting

### SMS envoyé mais statut reste "sent"?
- Vérifier que ngrok tourne
- Vérifier que l'URL ngrok est correcte dans Twilio
- Checker les logs du serveur: `console.log` ou terminal

### Erreur "Invalid phone number"?
- Vérifier le format: doit être `+351912345678`
- La fonction `formatPhoneNumberE164` convertit automatiquement

### Webhook pas appelé?
- Vérifier dans Twilio Console → Services → Integration → Logs
- Vérifier que ngrok est lancé
- Dans `.env.local`: mettre `SKIP_TWILIO_SIGNATURE_VALIDATION=true` pour dev

---

## 📊 Architecture Finale

```
Dashboard (SMS Page)
    ↓
/api/sms/send (POST)
    ↓
Twilio Messaging Service
    ↓
Client (SMS reçu ✅)
    ↓
Twilio Webhooks (Status Update)
    ↓
/api/webhooks/twilio/sms-status (POST)
    ↓
Database (SMSLog.status = "delivered")
    ↓
Dashboard affiche le statut ✅
```

---

## 🚀 En Production (Vercel)

```bash
# .env variables:
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=...
TWILIO_MESSAGING_SERVICE_SID=...
TWILIO_WEBHOOK_URL=https://pawlyx.vercel.app

# Dans Twilio Console:
POST URL: https://pawlyx.vercel.app/api/webhooks/twilio/sms-status
```

C'est tout! Les webhooks vont automatiquement mettre à jour les statuts. ✨
