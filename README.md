# StreamScribe

StreamScribe est une application Next.js conçue pour recevoir des flux de données en temps réel (webhooks) depuis un système externe comme un PBX. Elle affiche les données en direct sur une interface web, tout en les stockant dans des fichiers pour archivage.

## Fonctionnalités

- **Endpoints API multiples** : Fournit 4 URLs uniques pour recevoir différents types de données :
  - `/api/stream/advanced-calls`
  - `/api/stream/simplified-calls`
  - `/api/stream/agent-status`
  - `/api/stream/profile-availability`
- **Console en temps réel** : Affiche les données brutes de tous les flux dès leur réception sur la page d'accueil pour un suivi facile.
- **Affichage du JSON** : Montre le dernier objet JSON reçu, tous flux confondus.
- **Stockage des données** : Archive toutes les données brutes reçues dans des fichiers dédiés (`advanced-calls.json`, `simplified-calls.json`, etc.) dans le dossier `Data-Json` à la racine du projet. Le dossier `Data-Json` est créé automatiquement.

## Installation et Lancement sur un VPS

Suivez ces étapes pour installer et lancer l'application sur votre serveur ou VPS.

### Prérequis

- Node.js (version 20 ou supérieure)
- npm

### 1. Cloner le projet

Si vous avez le code sous forme de projet, clonez-le sur votre VPS. Sinon, copiez les fichiers du projet.

### 2. Lancer l'application (Méthode simple)

Naviguez jusqu'au répertoire du projet et exécutez la commande suivante pour installer les dépendances, corriger les paquets, compiler le projet et le démarrer :
```bash
npm install && npm audit fix && npm run build && npm run start
```
L'application se lancera sur le **port 9002**.

### 3. Ouvrir le port sur le pare-feu (Firewall)

**Ceci est une étape cruciale sur un VPS !** Vous devez autoriser le trafic entrant sur le port que votre application utilise.

Sur un VPS Debian/Ubuntu, l'outil `ufw` (Uncomplicated Firewall) est recommandé.

**a. Installez ufw s'il n'est pas présent :**
```bash
sudo apt update
sudo apt install ufw
```

**b. Ouvrez le port 9002 :**
```bash
sudo ufw allow 9002/tcp
```

**c. Activez le pare-feu :**
```bash
sudo ufw enable
```

### 4. Configurer votre PBX

- Une fois l'application lancée et le port ouvert, visitez son URL dans votre navigateur (ex: `http://VOTRE_IP_DE_VPS:9002`).
- Copiez les URLs des endpoints affichées sur la page.
- Collez ces URLs dans la configuration des webhooks ou des API de votre système PBX.

### 5. Consulter les logs (Recommandé avec `pm2`)

Pour voir les logs en direct et maintenir l'application en cours d'exécution même après avoir fermé votre terminal, il est fortement recommandé d'utiliser un gestionnaire de processus comme `pm2`.

**a. Installez pm2 globalement :**
```bash
sudo npm install -g pm2
```

**b. Lancez l'application avec pm2 :**
(Assurez-vous d'avoir exécuté `npm install` et `npm run build` au préalable)
```bash
# Remplacez "streamscribe" par le nom de votre choix
pm2 start npm --name "streamscribe" -- run start
```

**c. Affichez les logs en direct :**
```bash
pm2 logs streamscribe
```
C'est dans cette vue que vous verrez les messages "Received data for..." lorsque votre PBX enverra des informations.
