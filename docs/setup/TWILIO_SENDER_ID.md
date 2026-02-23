# 📱 Twilio - Configurer "Pawlyx" Comme Nom d'Envoyeur

## C'est Quoi un "Sender ID" ou "Alphanumeric Sender ID"?

Normalement, quand tu reçois un SMS, ça vient d'un numéro de téléphone:

```
📱 Reçu de: +351912345678
   Message: Rappel: tosquia demain à 10h
```

Avec un **Sender ID**, le client voit le nom à la place:

```
📱 Reçu de: Pawlyx
   Message: Rappel: tosquia demain à 10h
```

C'est plus cool et professionnel! ✨

---

## ⚠️ Important: Portugal & Sender ID

**Mauvaise nouvelle:** En Portugal, Twilio ne supporte **pas les Sender IDs alphanumériques** nativement.

**Bonnes nouvelles:**
1. Tu peux quand même utiliser Twilio (fonctionne avec les numéros)
2. Alternative: WhatsApp Business (affiche le nom "Pawlyx")
3. Alternative: Service email + SMS (email montre le sender)

---

## Option 1: Rester Avec Twilio (Simple)

**Tu envoies les SMS comme ça:**

```
De: +13345818587 (le numéro trial)
Ou: +351912345678 (un numéro portugais)

Texte: "Rappel: tosquia demain à 10h"
```

C'est simple et ça marche! Pas de problème.

---

## Option 2: Utiliser WhatsApp (Meilleur UX)

Au lieu d'SMS, tu envoies via **WhatsApp Business API** (affiche "Pawlyx"):

```
De: Pawlyx (WhatsApp Business)
   Message: "Rappel: tosquia demain à 10h"
```

### Avantages WhatsApp:
- ✅ Affiche le nom "Pawlyx"
- ✅ Plus fiable (moins de spam)
- ✅ Clients voient plus de détails
- ✅ Peut attacher des images/docs

### Désavantages:
- ⚠️ Clients DOIVENT avoir WhatsApp
- ⚠️ Besoin de plus d'approvals Twilio
- ⚠️ Légèrement plus cher

---

## Option 3: Email + SMS (Hybride)

Envoyer **EMAIL** (affiche "Pawlyx") + **SMS** de secours:

```
📧 Email:
   De: Pawlyx <hello@pawlyx.pt>
   Sujet: Rappel de votre rendez-vous 🐾

📱 SMS (si pas lu l'email):
   De: +351912345678
   Texte: "Rappel: tosquia demain!"
```

### Avantages:
- ✅ Email affiche "Pawlyx"
- ✅ SMS de backup fiable
- ✅ Plus d'infos dans l'email
- ✅ Pas de limitation pays

### Setup simple:
- Utiliser **Resend** ou **SendGrid** pour email
- Garder Twilio pour SMS

---

## Mon Recommandation Pour Toi

**Commencer avec:  Option 1 (Twilio simple)**

1. Les SMS marchent vraiment bien
2. Zéro complication
3. Peu cher (~€0.01 par SMS)
4. Clients reçoivent le rappel, c'est l'important

**Ajouter plus tard:**
- Email service (meilleure branding avec "Pawlyx")
- WhatsApp si les clients demandent

---

## Setup Actuel (Tu as Déjà Ça)

```
TWILIO_ACCOUNT_SID=ACe09a0a0a6678a3bb9056a8a4a5016418bd
TWILIO_AUTH_TOKEN=d78957f255153f0f0f60877c6c81b0415293
TWILIO_PHONE_NUMBER=+13345818587
```

SMS envoyés vont afficher: **+13345818587**

C'est OK pour tester! Quand tu paies, tu peux:
- Acheter un numéro portugais (+351...)
- SMS affichera ce numéro à la place

---

## Quand Tu Paies (Changer Numéro)

Une fois que tu auras une **carte de crédit** ajoutée:

1. Va à: https://console.twilio.com/phone-numbers/manage
2. Clicker: "Buy a Phone Number"
3. Chercher un numéro Portugal
4. Acheter (~€1-2/mois)
5. Changer `TWILIO_PHONE_NUMBER=+351912345678` dans `.env.local`
6. Voilà! SMS viendront du numéro portugais

---

## Résumé

| Aspect | Situation Actuelle | Quand tu Paies |
|--------|-------------------|-----------------|
| Numéro | +13345818587 (USA) | +351... (Portugal) |
| Sender ID "Pawlyx" | ❌ Pas en Portugal | Avec WhatsApp/Email |
| Coût | Gratuit (trial) | ~€0.01/SMS |
| Fiabilité | 100% | 100% |

**Pour "Pawlyx" comme nom:**
- SMS direct: ❌ Pas possible en Portugal
- Email: ✅ Très facile (Resend/SendGrid)
- WhatsApp: ✅ Possible (un peu plus complexe)

---

## À Faire Maintenant

Tu peux déjà tester Twilio avec ce qu'il y a:

1. Ajoute les 3 infos à `.env.local`
2. Redémarre le serveur
3. Test: `POST /api/reminders/test-sms` avec ton numéro

Ça va fonctionner! 🎉

---

## Questions Courantes

**Q: "Je veux absolument 'Pawlyx' en SMS"**
A: Faut utiliser WhatsApp API (un peu plus compliqué). On peut le faire plus tard!

**Q: "Je peux changer le numéro plus tard?"**
A: Oui! Juste change `TWILIO_PHONE_NUMBER` dans `.env.local`

**Q: "Combien ça coûte un numéro portugais?"**
A: ~€1-2 par mois (très pas cher!)

**Q: "Est-ce que le numéro trial va disparaître?"**
A: Non, tu peux le garder. Twillio garde ton compte gratuitement.
