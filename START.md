# 🚀 Comment lancer SkillManager en local

## Ports
| Service | Port |
|---------|------|
| API (NestJS) | `4000` |
| Web (Vite + React) | `3000` |

---

## 1. Installer les dépendances
```bash
bun install
```

## 2. Démarrer l'API (NestJS) sur le port 4000
```bash
bun run dev:api
```

## 3. Démarrer le Frontend (Vite + React) sur le port 3000
Ouvre un **deuxième terminal** :
```bash
bun run dev:web
```
👉 [http://localhost:3000](http://localhost:3000)

## 4. Lancer les Webhooks (Ngrok + Stripe CLI)
```bash
# Terminal 3 : Ngrok (expose l'API pour les webhooks Clerk)
ngrok http 4000

# Terminal 4 : Stripe CLI (forward les événements Stripe)
stripe listen --forward-to localhost:4000/v1/webhooks/stripe
```
> ⚠️ Mets à jour l'URL du webhook Clerk dans le Dashboard Clerk avec l'URL ngrok.

## 5. Tester la CLI
```bash
bun run cli/src/index.ts login
```
La CLI ouvre un lien vers `http://localhost:3000/cli?code=XXXX`.
Si tu n'es pas connecté, une page de login apparaît. Sinon, tu peux approuver ou refuser directement.

---

### ⚠️ Ports à éviter sur macOS
- **Port 5000** : bloqué par AirPlay Receiver
- **Port 6000** : bloqué par Chrome/Safari (`ERR_UNSAFE_PORT`, protocole X11)
