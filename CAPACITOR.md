# Capacitor Mobile App

Application mobile native avec Capacitor.

## Développement

### 1. Démarrer le serveur Next.js
```bash
npm run dev
```

### 2. Sync et lancer sur Android
```bash
npx cap sync
npx cap run android
```

### Ou en une commande :
```bash
npx cap:dev
```

## Build Production

### 1. Builder l'app Next.js
```bash
npm run build
```

### 2. Sync avec Capacitor
```bash
npx cap sync
```

### 3. Ouvrir Android Studio
```bash
npx cap open android
```

### 4. Dans Android Studio :
- Build → Generate Signed Bundle / APK
- Créer ou utiliser un keystore
- Signer l'APK/AAB
- Télécharger sur Google Play Store

## Configuration

- **App ID** : `com.guitarcard.app`
- **Nom** : Guitar Card
- **URL dev** : `http://10.0.2.2:3000` (10.0.2.2 = localhost depuis l'émulateur Android)
- **Base de données** : SQLite local (`prisma/dev.db`)

## Notes

- Pour le développement, l'app charge le serveur Next.js en local
- Pour la production, pointer `capacitor.config.json` vers l'URL déployée (Vercel, etc.)
- L'émulateur Android utilise `10.0.2.2` au lieu de `localhost`
- Sur appareil physique, utiliser l'IP locale de ta machine

## Déploiement en production

1. Déployer Next.js sur Vercel/Railway
2. Mettre à jour `capacitor.config.json` :
   ```json
   "server": {
     "url": "https://ton-app.vercel.app"
   }
   ```
3. `npx cap sync`
4. Build l'APK dans Android Studio
