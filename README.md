#  🤖 [@informatecibot](https://t.me/informatecibot)
Bot di supporto per il gruppo Telegram di Informatica a Pisa ([clicca qui per entrare](https://t.me/informaticaunipi)).

## Avviare il bot
Per utilizzare il bot basta [cliccare qui](https://t.me/informatecibot).

Per far partire una vostra copia del bot, assicurarsi di avere *Node.js* e *NPM*
installati sul proprio sistema.

Inoltre è necessario richiedere un token per le API di Telegram, contattando [@BotFather](https://t.me/botfather).
Può esservi utile annotarsi anche il proprio id Telegram,
necessario per alcune funzionalità.

```bash
$ git clone https://github.com/pitasi/informatecibot
$ cd informatecibot
$ npm install

# Se avete solo il token
$ TOKEN=ilvostrotoken npm start

# OPPURE Se avete il vostro id Telegram
$ TOKEN=ilvostrotoken ADMINS=123123 npm start

# OPPURE In caso di più admin
$ TOKEN=ilvostrotoken ADMINS="123123 789789" npm start
```

## Funzionalità
Allo stato attuale, il bot è suddiviso in moduli.
Ciascuno dei quali fornisce una funzione differente, i moduli sono inseriti
nella cartella `src/modules` e sono caricati automaticamente all'avvio.

Notare che un modulo semplice può essere semplicemente un file `nomemodulo.js`,
mentre per necessità più avanzate si può creare una cartella `nomemodulo/` che
deve avere **necessariamente** un file `index.js` al suo interno. Per avere una
idea di come sono strutturati i moduli fare riferimento a quelli esistenti.

### Moduli attivi
| Nome | Descrizione | Autore |
| --- | --- | --- |
| TODO | TODO | Antonio Pitasi |


## Dipendenze
Questo bot è creato utilizzando il wrapper
[Telegraf](https://github.com/telegraf/telegraf) per Node.js.

Viene fornito anche un Dockerfile per semplificare sviluppo e deploy in locale.

Allo stato attuale non è necessario altro per far partire il bot,
in futuro potrebbe esserci bisogno di un database.

## Contribuire
Qualsiasi idea è ben accetta, fate una Pull Request!

## Altre informazioni
In caso di problemi da segnalare o funzioni da suggerire aprire un issue qui su
GitHub oppure scrivere all'interno del
[gruppo di Informatica](https://t.me/informaticaunipi).
