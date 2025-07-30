# StreamScribe

StreamScribe est une application Next.js conçue pour recevoir des flux de données en temps réel (webhooks) depuis un système externe comme un PBX. Elle affiche les données en direct sur une interface web, tout en les stockant dans un fichier pour archivage.

## Fonctionnalités

- **Endpoint API** : Fournit une URL unique (`/api/stream`) pour recevoir des données via des requêtes POST.
- **Console en temps réel** : Affiche les données brutes dès leur réception sur la page d'accueil pour un suivi facile.
- **Affichage du JSON** : Montre le dernier objet JSON reçu du flux.
- **Stockage des données** : Archive toutes les données brutes reçues dans le fichier `Data-Json/datacalls.json` à la racine du projet. Le dossier `Data-Json` est créé automatiquement.

## Installation et Lancement sur un VPS

Suivez ces étapes pour installer et lancer l'application sur votre serveur ou VPS.

### Prérequis

- Node.js (version 20 ou supérieure)
- npm

### 1. Cloner le projet

Si vous avez le code sous forme de projet, clonez-le sur votre VPS. Sinon, copiez les fichiers du projet.

### 2. Installer les dépendances

Naviguez jusqu'au répertoire du projet et installez les paquets nécessaires :

```bash
npm install
```

### 3. Compiler l'application

Compilez le projet pour la production :

```bash
npm run build
```

### 4. Lancer l'application

Démarrez le serveur de production :

```bash
npm run start
```
L'application se lancera sur le **port 9002**.

### 5. Ouvrir le port sur le pare-feu (Firewall)

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

### 6. Configurer votre PBX

- Une fois l'application lancée et le port ouvert, visitez son URL dans votre navigateur (ex: `http://VOTRE_IP_DE_VPS:9002`).
- Copiez l'URL de l'endpoint affichée sur la page.
- Collez cette URL dans la configuration des webhooks ou des API de votre système PBX. L'URL doit être `http://VOTRE_IP_DE_VPS:9002/api/stream`.

### 7. Consulter les logs (Recommandé)

Pour voir les logs en direct (y compris les données reçues affichées par `console.log`), vous pouvez utiliser un gestionnaire de processus comme `pm2`. C'est très utile pour diagnostiquer les problèmes.

**a. Installez pm2 globalement :**
```bash
sudo npm install -g pm2
```

**b. Lancez l'application avec pm2 :**
```bash
# Remplacez "streamscribe" par le nom de votre choix
pm2 start npm --name "streamscribe" -- run start
```

**c. Affichez les logs en direct :**
```bash
pm2 logs streamscribe
```
C'est dans cette vue que vous verrez les messages "Received data:" lorsque votre PBX enverra des informations.
