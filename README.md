# Mon Bot Telegram

Structure modulaire inspirée de GoatBot : chaque commande est un fichier
indépendant dans `commands/`, chargé automatiquement au démarrage.

## Installation

```bash
npm install
cp .env.example .env
# remplis BOT_TOKEN (via @BotFather) et OWNER_ID (ton ID Telegram, via @userinfobot)
npm start
```

## Ajouter une commande

Crée un fichier dans `commands/`, par exemple `commands/bonjour.js` :

```js
module.exports = {
  config: {
    name: "bonjour",
    aliases: ["hello"],
    description: "Dit bonjour",
    usage: "/bonjour",
    ownerOnly: false,
  },
  async run(ctx) {
    ctx.reply("Bonjour !");
  },
};
```

Envoie ensuite `/install` (réservé au propriétaire) pour recharger les
commandes sans redémarrer le bot.

## Ajouter un event

Crée un fichier dans `events/` (voir `events/newcommandevent.eg.js` comme modèle) :

```js
module.exports = {
  config: {
    name: "monevent",
    type: "any", // "new_chat_members", "left_chat_member" ou "any"
  },
  async run(ctx) {
    // logique ici
  },
};
```

## Commandes incluses (fonctionnelles)

- `/help [commande]` — liste les commandes ou détaille l'une d'elles
- `/ping` — teste la latence du bot
- `/whoami` — affiche tes infos Telegram (ID, username, chat)
- `/info` — infos générales du bot (uptime, nombre de commandes, Node.js)
- `/echo <texte>` — répète le texte fourni
- `/dice [faces]` — lance un dé (6 faces par défaut)
- `/coinflip` — pile ou face
- `/calc <expression>` — évalue une expression mathématique simple
- `/avatar` — renvoie ta photo de profil Telegram
- `/install` — recharge commandes + events à chaud (owner uniquement)

## Modération / admin (fonctionnelles)

- `/ban` (en réponse à un message, ou `/ban <id>`) — bannit du groupe
- `/kick` (en réponse, ou `/kick <id>`) — expulse (peut revenir, contrairement à `/ban`)
- `/warn` (en réponse) — avertit ; ban automatique au 3e avertissement
- `/badwords add|remove|list|on|off [mot]` — liste de mots interdits + suppression auto des messages qui en contiennent
- `/rules [set <texte>]` — affiche ou définit le règlement du groupe
- `/setrole <admin|vip|member>` (en réponse) — rôle interne au bot, réutilisable par d'autres commandes plus tard
- `/adminonly <on|off>` — restreint l'usage de toutes les commandes du bot aux admins du groupe
- `/uid` (en réponse, optionnel) — ID Telegram de toi ou de la personne citée
- `/tid` — ID du chat/groupe actuel

Toutes ces commandes de modération nécessitent que **le bot lui-même soit
admin du groupe** (droits de ban/kick/suppression de messages), et que
**l'utilisateur qui les lance soit admin** — sauf en message privé où la
vérification est ignorée. Pour cibler quelqu'un, réponds à un de ses
messages (Telegram ne permet pas de résoudre un `@pseudo` en ID sans que
la personne ait déjà écrit au bot).

Ces commandes stockent leurs données (warns, mots interdits, règlement,
rôles) dans `data/db.json`, un simple fichier JSON — **remis à zéro à
chaque redéploiement sur Render** (disque éphémère). Passe sur MongoDB
Atlas (comme pour ton bot Senpai Stickers) si tu veux que ça survive aux
redéploiements.

## Commandes stub (à implémenter)

168 fichiers de commandes ont été générés dans `commands/` avec les noms
repris de CHRISTUS-GOATBOT-PUBLIC (ex: `roulette.js`, `blackjack.js`,
`weather.js`, `translate.js`, `gpt.js`...). Chacun répond juste
"pas encore implémentée" pour l'instant — le contenu original de ces
commandes GoatBot n'a pas été repris, seuls les noms et le format
`{ config, run }` sont en place. Ouvre un fichier, remplace le `TODO` et
la logique dans `run()`.

## Events inclus

- `welcome.js` — message de bienvenue (`new_chat_members`), fonctionnel
- `leave.js` — message de départ (`left_chat_member`), fonctionnel
- `checkwarn.js`, `logsbot.js`, `autoUpdateInfoThread.js`, `onEvent.js` — stubs à implémenter (type `any`, déclenchés sur chaque message texte)
- `newcommandevent.eg.js` — template, jamais chargé (suffixe `.eg.js`)

## Déploiement

Compatible Render (comme Mini Bot) : `npm start` comme commande de démarrage,
variables d'environnement dans le dashboard Render plutôt que `.env`.
