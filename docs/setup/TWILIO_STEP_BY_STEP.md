# 📱 Twilio - Guide Pas à Pas (Avec Captures)

## Étape 1: Récupérer Account SID & Auth Token

**IMPORTANT:** Ces infos ne sont PAS dans "Messaging", tu dois aller dans "Account"!

### 1.1 Clicker sur le menu (en haut à gauche)

- Cherche "Account" dans le menu principal
- Clicker dessus

### 1.2 Aller à "Account Settings"

```
Twilio Console
├── Account
│   ├── Dashboard (ici tu es)
│   └── Account Settings ← VA ICI!
```

Clicker dans le lien "Account Settings" ou va à: **https://console.twilio.com/account/keys-credentials**

### 1.3 Tu verras deux choses:

```
┌─────────────────────────────────────┐
│ ACCOUNT SID                         │
│ AC1234567890abcdef1234567890abcdef  │ ← Copie ça
│ [Copy button]                       │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ AUTH TOKEN                          │
│ ••••••••••••••••••••••••••••••[eye] │
│ [Clicker l'oeil pour voir]          │
│                                     │
│ abc123def456ghi789jkl012mno345pqr   │ ← Copie ça
│ [Copy button]                       │
└─────────────────────────────────────┘
```

**⚠️ Ne partage JAMAIS le Auth Token avec personne!**

---

## Étape 2: Obtenir un Numéro de Téléphone Twilio

Maintenant tu peux aller dans "Messaging" pour récupérer un numéro!

### 2.1 Va dans Messaging > Senders

```
Twilio Console
├── Messaging
│   └── Senders ← VA ICI!
```

### 2.2 Clicker le gros bouton "+" pour ajouter un Sender

Tu verras deux options:

```
┌─────────────────────────────┐
│ Create a Phone Number       │ ← CLIQUE ICI!
│                             │
│ Buy a dedicated phone       │
│ number for SMS              │
└─────────────────────────────┘

┌─────────────────────────────┐
│ Create a Short Code         │
│                             │
│ Use a short code for SMS    │
│ (trop compliqué pour nous)  │
└─────────────────────────────┘
```

### 2.3 Clicker "Create a Phone Number"

Tu dois:

1. **Choisir le pays:** Portugal 🇵🇹
2. **Choisir le type:** SMS (déjà sélectionné)
3. **Rechercher:** Clicker "Search" pour trouver des numéros dispo
4. **Choisir:** Un numéro te plaît? Clicker dessus
5. **Acheter:** Clicker "Buy" (c'est gratuit en trial!)

### 2.4 Tu auras un numéro comme:

```
+351912345678
```

**Copie ce numéro!**

---

## Étape 3: Les 3 Infos à Copier

Tu as maintenant les 3 choses:

```bash
TWILIO_ACCOUNT_SID=AC1234567890abcdef1234567890abcdef
TWILIO_AUTH_TOKEN=abc123def456ghi789jkl012mno345pqr
TWILIO_PHONE_NUMBER=+351912345678
```

---

## Étape 4: Ajouter à .env.local

Ouvre le fichier `.env.local` à la racine du projet et ajoute:

```bash
# Twilio SMS
TWILIO_ACCOUNT_SID=AC1234567890abcdef1234567890abcdef
TWILIO_AUTH_TOKEN=abc123def456ghi789jkl012mno345pqr
TWILIO_PHONE_NUMBER=+351912345678
```

Sauve le fichier!

---

## Étape 5: Redémarrer le Serveur

Terminal (Windows):

```bash
npm run dev
```

Si tu as déjà un serveur qui tourne, appuie sur **Ctrl+C** et relance `npm run dev`

---

## Étape 6: Vérifier que tout marche

### 6.1 Test simple

Ouvre Postman (ou un autre outil REST) et fais:

```
GET http://localhost:3001/api/reminders/test-sms
```

Tu devrais recevoir:

```json
{
  "configured": true,
  "phoneNumber": "+351912345678",
  "message": "Twilio is properly configured!"
}
```

### 6.2 Envoyer un SMS de test

```
POST http://localhost:3001/api/reminders/test-sms

Body (JSON):
{
  "phoneNumber": "912345678"
}
```

Tu devrais recevoir un SMS! 📱

Si tu reçois un SMS avec "Teste:" → **Ça marche!** 🎉

---

## Résumé (TL;DR)

1. ✅ Va dans: Account → Account Settings
2. ✅ Copie: Account SID + Auth Token
3. ✅ Va dans: Messaging → Senders → +
4. ✅ Crée un Phone Number pour Portugal
5. ✅ Copie le numéro (ex: +351912345678)
6. ✅ Ajoute les 3 infos à `.env.local`
7. ✅ Redémarre le serveur: `npm run dev`
8. ✅ Teste avec POST /api/reminders/test-sms

---

## Besoin d'Aide?

**"Je vois pas Account Settings"**
→ Va directement à: https://console.twilio.com/account/keys-credentials

**"Je vois pas Senders"**
→ Va à: https://console.twilio.com/phone-numbers/manage

**"Le bouton +'est pas visible"**
→ Scroll vers le bas de la page

**"Je ne peux pas acheter un numéro"**
→ En trial account Twilio, tu peux en avoir 1 gratuit. Si t'en as déjà un, il apparaîtra dans la liste, pas besoin d'en acheter un autre.

---

## Points Importants

⚠️ **Auth Token = mot de passe secret**
- Ne le mets JAMAIS sur GitHub
- Ne le partages avec personne
- C'est secret comme un password

✅ **Phone Number = public**
- Ce numéro sera montré à tes clients
- C'est OK de le partager

✅ **Account SID = identifiant public**
- C'est juste pour identifier le compte
- C'est OK de le partager

---

**Une fois que c'est fait, tes SMS de reminder vont marcher automatiquement!** 🎉
