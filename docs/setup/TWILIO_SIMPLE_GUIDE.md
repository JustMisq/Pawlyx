# 📱 Twilio - Explication Simple (Pour les Débutants)

## C'est Quoi Twilio?

Twilio = une service qui **envoie des SMS** pour toi.

Tu dis "Envoie un SMS à ce numéro", Twilio le fait. C'est tout! 

**Comparaison simple:**
- Avant: Tu envoie les SMS manuellement via ton téléphone
- Avec Twilio: L'application les envoie automatiquement

## Pourquoi on l'Utilise?

Dans Pawlyx, quand un client prend un rendez-vous demain:
- 24h avant → Le système envoie automatiquement un SMS de rappel au client
- Client reçoit: "Rappel: tosquia pour Doggo demain à 10h30!"

Sans Twilio, faudrait envoyer les SMS manuellement. 😴

## Combien ça Coûte?

**Compte Twilio Trial (Gratuit):**
- ✅ Complètement gratuit pour commencer
- ✅ Peux envoyer des SMS de test
- ⚠️ Limitation: Seulement à des numéros pré-approuvés (max 10)

**Quand tu vas en production:**
- ~$0.01 par SMS (1 centime d'euro environ)
- Portugal: Environ €0.0075 par SMS
- Paye seulement ce que tu utilises

**Pour un petit salon:** 50 clients × 1 SMS par mois = ~€0.38/mois! 💰

## Comment Commencer (Pas à Pas Simple)

### Étape 1: Créer un Compte Trial (5 min)

1. Aller à https://www.twilio.com/try-twilio
2. Cliquer "Sign up"
3. Entrer email + password
4. Vérifier ton email (clic sur le lien)
5. Remplir le formulaire:
   - Prénom, nom
   - Numero de tele (pour verifier c'est toi)
   - Clicker "Get Started"

✅ Compte créé!

### Étape 2: Trouver tes 3 Infos Magiques (2 min)

Une fois connecté au dashboard Twilio:

1. **Account SID** (identifiant):
   - Aller à: https://console.twilio.com/
   - Regarde le "Account SID" en haut à gauche
   - Copier-coller dans un notepad

2. **Auth Token** (mot de passe secret):
   - Même page, à côté du "Account SID"
   - Cliquer sur l'œil pour le montrer
   - Copier-coller

3. **Numéro Twilio** (ton número d'envoi):
   - Aller à: https://console.twilio.com/phone-numbers/incoming
   - Tu dois en "acheter" un gratuit
   - Cliquer le + pour en ajouter
   - Choisir "SMS" et Portugal (ou ton pays)
   - Confirmer
   - Tu auras quelque chose comme: `+351912345678`

### Étape 3: Ajouter à .env.local (2 min)

Ouvre le fichier `.env.local` à la racine du projet:

```bash
# Twilio (ajoute ces 3 lignes)
TWILIO_ACCOUNT_SID=AC1234567890abcdef1234567890abcdef
TWILIO_AUTH_TOKEN=abc123def456ghi789jkl012mno345pqr
TWILIO_PHONE_NUMBER=+351912345678
```

Remplace les valeurs avec **tes infos** de Twilio!

### Étape 4: Tester (1 min)

Ouvre Postman ou un terminal:

```bash
# Vérifier que tout est bien configuré
curl http://localhost:3001/api/reminders/test-sms

# Réponse attendue:
# { "configured": true, "phoneNumber": "+351912345678", ... }
```

### Étape 5: Envoyer un SMS de Test (1 min)

Via Postman (ou curl):

```
POST http://localhost:3001/api/reminders/test-sms

Body (JSON):
{
  "phoneNumber": "912345678",
  "message": "Coucou! Test de Twilio 🎉"
}
```

Tu recevras un SMS? **Ça marche!** 🎉

## Comprendre le Flow

```
1. Client crée un RDV demain à 10h
   ↓
2. Système crée automatiquement:
   - EMAIL reminder (24h avant)
   - SMS reminder (24h avant)
   ↓
3. Chaque 5 minutes, le système vérifie:
   "Y a des rappels à envoyer?"
   ↓
4. Si oui ET il est 24h avant le RDV:
   → Appelle Twilio
   → Twilio envoie le SMS
   → Marqué comme "sent" ✅
   ↓
5. Client reçoit SMS: "Rappel: tosquia demain à 10h!"
```

## Erreurs Courantes & Solutions

### "Twilio not configured"

❌ **Problème:** Les infos Twilio ne sont pas dans `.env.local`

✅ **Solution:**
- Vérifie que t'as ajouté les 3 lignes
- Redémarre le serveur (`npm run dev`)

### "Invalid phone number"

❌ **Problème:** Le numéro du client n'est pas au bon format

✅ **Information:**
- Système accepte: `912345678` ou `+351912345678`
- Système refuse: `91 234 5678` ou `0912345678`

### SMS ne reçoit pas (Trial account)

❌ **Problème:** Twilio Trial peut seulement envoyer à des numéros pré-approuvés

✅ **Solution:**
- Ajoute d'abord TON numéro comme "verified caller"
- Dans Twilio console: Verified Caller IDs
- Ajoute ton numéro, reçois un appel de confirmation
- Voilà, tu peux recevoir des SMS de test

### "Account SID not found"

❌ **Problème:** Peut-être t'as pas de numéro Twilio attribué

✅ **Solution:**
- Va à https://console.twilio.com/phone-numbers/incoming
- Clique le gros "+" en bas à droite
- "Buy a phone number"
- Choisis Portugal
- Choisis SMS
- "Search"
- Clique celui que tu veux
- "Buy" (c'est gratuit en trial!)

## Questions Fréquentes

**Q: C'est obligatoire de utiliser Twilio?**
A: Non! Si tu veux seulement email reminders, laisse SMS désactivé. Ça marche sans.

**Q: Je peux utiliser un autre service SMS?**
A: Oui, mais tu devras modifier le code. Twilio est facile et pas cher.

**Q: Combien ça coûte quand je passe à production?**
A: Environ €0.01 par SMS. Pour 50 clients, ~€0.50/mois max.

**Q: Comment je "paie" en trial?**
A: Tu paies rien! C'est gratuit. Quand tu es prêt, tu ajoutes une carte de crédit et c'est tout.

**Q: Et si je oublie de payer?**
A: Twilio arrête d'envoyer les SMS, c'est tout. Pas de pénalité.

## Résumé (TL;DR)

1. Va à twilio.com/try-twilio → Sign up (5 min)
2. Copie 3 infos de ton dashboard
3. Ajoute à `.env.local`
4. Redémarre serveur
5. Teste avec POST /api/reminders/test-sms
6. **C'est tout!** 🎉

## Besoin d'Aide?

Si quelque chose marche pas:
1. Vérifie les 3 variables dans `.env.local`
2. Redémarre le serveur
3. Essaye le test endpoint
4. Regarde les logs du serveur (terminal)

Les erreurs vont t'aider! Elles disent exactement ce qui va pas. 😊

---

**Pas grave si tu comprends pas tout maintenant!** 
On peut laisser ça en "pending" et y revenir quand tu es prêt. 
L'important c'est que c'est configurable et optionnel. 👍
