# 🚀 Guide de Déploiement Vercel - Groomly

## ⚠️ Problèmes Résolus

Les corrections apportées règlent les problèmes de build Vercel:
- ✅ Configuration `vercel.json` optimisée
- ✅ Gestion Sentry safe pour Vercel
- ✅ Variables d'environnement correctement détectées
- ✅ Build Command optimisé (Prisma generate intégré)

---

## 📋 Checklist Avant Déploiement

### 1️⃣ Code & Git
```bash
# Commiter les changements
git add .
git commit -m "chore: fix Vercel build configuration"
git push origin main
```

### 2️⃣ Vérifier Localement
```bash
# Nettoyer et rebuildérer
rm -rf .next node_modules
npm install
npm run build
npm start
# Tester http://localhost:3000
```

### 3️⃣ Variables d'Environnement Requises

Aller sur **Vercel → Project Settings → Environment Variables** et ajouter:

#### ✅ REQUIS (Production)
```
DATABASE_URL = postgresql://...
NEXTAUTH_URL = https://votre-domaine.vercel.app
NEXTAUTH_SECRET = <générer avec: openssl rand -base64 32>
```

#### ⭐ Fortement Recommandé
```
STRIPE_PUBLISHABLE_KEY = pk_live_...
STRIPE_SECRET_KEY = sk_live_...
STRIPE_PRICE_ID_MONTHLY = price_...
STRIPE_PRICE_ID_YEARLY = price_...
```

#### 📝 Optionnel
```
NEXT_PUBLIC_SENTRY_DSN = (pour error tracking)
REDIS_URL = (si rate limiting requis)
```

### 4️⃣ Générer NEXTAUTH_SECRET
```bash
# Option 1: OpenSSL (recommandé)
openssl rand -base64 32

# Option 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**⚠️ IMPORTANT**: Chaque env (dev, staging, prod) doit avoir un SECRET différent!

---

## 🔧 Processus de Déploiement

### Méthode 1: Via Vercel Dashboard (Plus Facile)

1. Aller à https://vercel.com/new
2. Sélectionner votre repo Groomly
3. Cliquer "Import"
4. Dans "Configure Project":
   - Framework Preset: **Next.js** (détecté auto)
   - Environment Variables: **Ajouter tous les secrets requis**
5. Cliquer "Deploy"
6. Attendre ~2 minutes

### Méthode 2: Via Vercel CLI

```bash
# Installer Vercel CLI
npm install -g vercel

# Logger et lier le projet
vercel link

# Ajouter les secrets
vercel env add DATABASE_URL   # Copier votre PostgreSQL URL
vercel env add NEXTAUTH_URL   # Ex: https://groomly-prod.vercel.app
vercel env add NEXTAUTH_SECRET # Générer nouvelle valeur

# Déployer
vercel deploy --prod
```

---

## 🆘 Dépannage Erreurs Courantes

### ❌ "Build failed - Database connection error"
**Solution:**
```
1. Vérifier DATABASE_URL est correct
2. Copier EXACTEMENT depuis Railway/Supabase
3. Inclure le port (habituellement :5432)
4. Pas d'espaces avant/après
```

### ❌ "NEXTAUTH_SECRET is not set"
**Solution:**
```
1. Générer: openssl rand -base64 32
2. Copier EXACTEMENT le résultat
3. Ajouter dans Vercel Environment Variables
4. Redéployer (Vercel → Deployments → Redeploy)
```

### ❌ "Build timeout - taking too long"
**Solution:**
```
✅ C'est normal si < 5 minutes
Si > 5 min:
1. Vérifier Build logs (Vercel → Deployments → Build logs)
2. Si Prisma generate bloque:
   - DATABASE_URL invalide
   - Connexion PostgreSQL lente
3. Test local: npm run build
```

### ❌ "Runtime error - 500 on /api/clients"
**Solution:**
```
1. Vérifier DATABASE_URL en production
2. Migrations appliquées sur Base de Données production
3. Roles/permissions du user PostgreSQL
4. Check Sentry logs (si configuré)
```

### ❌ "Webhook Stripe not working"
**Solution:**
```
1. Mode LIVE Stripe activé
2. Price IDs existent en mode LIVE (pas test)
3. Webhook Secret correct (whsec_live_... pas test)
4. URL: https://votre-domaine.vercel.app/api/webhooks/stripe
```

---

## ✅ Vérification Post-Déploiement

Après succès du build:

### 1️⃣ Test Accès Landing Page
```
https://votre-domaine.vercel.app
→ Doit charger avec contenu
```

### 2️⃣ Test Authentification
```
1. Aller à /auth/register
2. Créer un compte
3. Redirection à /dashboard
```

### 3️⃣ Test API
```bash
curl https://votre-domaine.vercel.app/api/auth/user \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4️⃣ Test Base de Données
```
Login → Dashboard → Clients
→ Voir vos clients créés en prod
```

---

## 🔐 Sécurité en Production

### ✅ À Vérifier
- [ ] BASE_URL est HTTPS
- [ ] NEXTAUTH_SECRET unique et sécurisé
- [ ] Pas de secrets dans code source
- [ ] `.env.local` dans `.gitignore`
- [ ] Stripe en mode LIVE (pas test)
- [ ] Database en mode prod (Railway/Supabase)

### 🔒 Headers de Sécurité
Automatiquement configurés dans `next.config.js`:
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- CORS limité au domain spécifique

---

## 🆗 Rollback d'Urgence

Si quelque chose casse en prod:

```bash
# Via Vercel Dashboard
Vercel → Deployments → [Previous] → Promote

# Ou redéployer version précédente
git revert HEAD
git push origin main
# Vercel rebuildera automatiquement
```

---

## 📊 Monitoring en Production

### Logs
```
Vercel Dashboard → Project → Deployments → [Current] → Logs
```

### Erreurs
```
Si NEXT_PUBLIC_SENTRY_DSN configuré:
Sentry Dashboard → Issues → Voir erreurs runtime
```

### Performance
```
Vercel Analytics:
Dashboard → Deployments → Performance
```

---

## ❓ FAQ

**Q: Combien de temps pour déployer?**
A: 2-5 minutes selon la taille du build

**Q: Migrations Prisma appliquées auto?**
A: NON - Vous devez les faire manuellement:
```
vercel env pull .env.production.local
npx prisma migrate deploy --skip-generate
```

**Q: Comment mettre à jour en production?**
A: Push sur main → Vercel redéploie automatiquement

**Q: Perte de données si je redéploie?**
A: NON - Database est séparée, données persistent

**Q: Budget Vercel?**
A: Gratuit pour une app SaaS sauf Edge Functions

---

## 🚪 Prochaines Étapes

1. ✅ Fixer les configs (DÉJÀ FAIT)
2. 📋 Ajouter secrets Vercel
3. 🚀 Déployer via Dashboard
4. ✔️ Tester fonctionnalités
5. 📊 Configurer monitoring

---

**Besoin d'aide?**
- Docs Next.js: https://nextjs.org/docs
- Docs Vercel: https://vercel.com/docs
- Discord Vercel: https://vercel.com/support
