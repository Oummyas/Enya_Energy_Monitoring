# Démo Loom – Enya Energy Monitoring (5 minutes)

Script de présentation du projet Enya pour la certification.

## Avant d'enregistrer

- Ouvrir la **version en ligne sur Vercel** (pas `localhost`) : cela montre que l'app est déployée.
- Cliquer sur **« Reset demo »** dans le panneau de démo pour repartir de données propres.
- Préparer **deux fenêtres** sur la page Linky :
  - une fenêtre **avec** le panneau de démo (le simulateur) ;
  - une fenêtre **sans** le panneau (fermé avec la croix « Close in this window »).
- Fermer les notifications et zoomer le navigateur à 110–125 %.
- Dans Loom, choisir **« Full screen » (plein écran)** et non « Window » : sinon la deuxième fenêtre n'apparaîtra pas à l'étape 6.

## Quelle fenêtre montrer ?

- **Étapes 1 à 5** : uniquement la fenêtre **sans** le panneau de démo (écran plus propre, vue utilisateur).
- **Étape 6** : les **deux fenêtres côte à côte** (`Win + ←` sur l'une, `Win + →` sur l'autre).
  - À gauche, la fenêtre avec le panneau : c'est vous qui simulez les compteurs.
  - À droite, la fenêtre sans le panneau : c'est l'écran du gestionnaire. C'est elle qui prouve le temps réel.
- **Étape 7** : revenir à une seule fenêtre.

## Script minuté

### 1. Introduction (0:00 – 0:30)

> « Bonjour, je suis [prénom]. Je vous présente **Enya Energy Monitoring**, une application web qui suit les compteurs Linky d'un parc d'appartements et détecte les consommations anormales pouvant signaler une fraude. »

### 2. Connexion et sécurité (0:30 – 0:55)

- Se connecter rapidement.

> « Grâce au Row Level Security de Supabase, chaque utilisateur ne voit que ses propres données, et c'est vérifié dans la base elle-même. »

### 3. Appartements (0:55 – 1:40)

- Montrer la page d'accueil, puis **Apartments**.
- Modifier un appartement existant (plus rapide qu'en créer un) : propriétaire, appareils.

> « C'est un CRUD complet, fait avec des Server Actions Next.js. »

### 4. Compteurs Linky et fraude (1:40 – 2:25)

- Ouvrir **Linky** : les compteurs suspects sont en tête, en rouge ; les compteurs du haut donnent le total, les actifs et les fraudes.

> « La règle : un compteur **actif** qui consomme moins de **100 kWh** est signalé comme fraude suspectée. »

### 5. Consommation (2:25 – 2:55)

- Parcourir **Consumption** : moyenne par appartement, évolution mensuelle, coût en euros. Ne pas s'attarder.

### 6. Démo en temps réel (2:55 – 4:10) ⭐

- Deux fenêtres côte à côte, cliquer sur **Start simulator**.
- Cliquer sur **Fraud** : un compteur passe au rouge dans les deux fenêtres.
- Cliquer sur **Heating peak**.

> « À gauche je simule les compteurs Linky, à droite c'est l'écran du gestionnaire : il voit la fraude apparaître en direct, sans recharger la page. Supabase Realtime envoie chaque changement de la base aux navigateurs ouverts. »

### 7. Technique et conclusion (4:10 – 5:00)

> « Stack : Next.js, React 19, TypeScript, Supabase (PostgreSQL, Auth, RLS, Realtime), Tailwind et shadcn/ui, avec déploiement continu sur Vercel. »

- Ouvrir **Ask Enya** : « Prochaine étape, un assistant IA pour interroger les données en langage naturel. »

> « Merci pour votre attention. »

## Conseils

- Faire une répétition chronométrée. En cas de dépassement, raccourcir d'abord l'étape 5, jamais la démo en temps réel.
- Parler de ce que l'outil **apporte à l'utilisateur**, pas seulement de ce que l'on clique.
- Une erreur pendant l'enregistrement se coupe au montage dans Loom : inutile de tout recommencer.
- Après l'enregistrement, cliquer sur **Reset demo** pour remettre les données d'origine.
