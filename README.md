# ChatGPT Mobile

Application mobile Android (React Native / Expo) permettant de discuter avec ChatGPT et d'exporter les conversations en fichier texte.

## Fonctionnalités

- 💬 **Chat avec ChatGPT** — Interface de messagerie intégrée avec l'API OpenAI (modèle `gpt-4o-mini` par défaut)
- 📤 **Export de conversation** — Exportez n'importe quelle discussion en fichier `.txt` via le partage natif Android
- ➕ **Nouvelle conversation** — Démarrez une nouvelle session à tout moment
- 🌙 **Thème sombre** — Interface sombre inspirée de ChatGPT

## Prérequis

- [Node.js](https://nodejs.org/) ≥ 18
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (`npm install -g expo-cli`)
- Un compte [OpenAI](https://platform.openai.com/) avec une clé API

## Installation

```bash
# Cloner le dépôt
git clone https://github.com/chaigneauP/expo-mobile.git
cd expo-mobile

# Installer les dépendances
npm install

# Configurer la clé API OpenAI
cp .env.example .env
# Éditez .env et remplacez la valeur de EXPO_PUBLIC_OPENAI_API_KEY
```

## Lancement

```bash
# Démarrer Expo
npm start

# Ou directement sur Android
npm run android
```

Scannez le QR code avec l'application **Expo Go** sur votre téléphone Android.

## Configuration

| Variable | Description |
|----------|-------------|
| `EXPO_PUBLIC_OPENAI_API_KEY` | Votre clé API OpenAI (ex : `sk-...`) |

## Structure du projet

```
├── App.tsx                     # Point d'entrée de l'application
├── index.ts                    # Enregistrement du composant racine
├── app.json                    # Configuration Expo
├── src/
│   ├── screens/
│   │   └── ChatScreen.tsx      # Écran principal de chat
│   ├── components/
│   │   └── MessageBubble.tsx   # Composant bulle de message
│   ├── services/
│   │   ├── openai.ts           # Intégration API OpenAI
│   │   └── export.ts           # Export de conversation en .txt
│   └── types/
│       └── index.ts            # Types TypeScript partagés
└── .env.example                # Modèle de fichier d'environnement
```

## Sécurité

> ⚠️ **Ne committez jamais votre fichier `.env`** contenant votre clé API.
> Le fichier `.gitignore` est configuré pour l'exclure automatiquement.
> La clé API est exposée côté client via le préfixe `EXPO_PUBLIC_` — utilisez uniquement des clés avec des quotas limités pour le développement.
