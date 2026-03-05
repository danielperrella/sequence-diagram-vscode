# AGENTS.md

## Repository Scope

Questo repository contiene una estensione VS Code per lavorare con `sequencediagram.org` direttamente dall'editor.

## Working Rules

- Mantieni TypeScript come linguaggio principale per l'estensione.
- Usa `pnpm` come package manager del repository.
- Preserva una struttura semplice: `src/` per il codice, `media/` per asset statici, `dist/` come output compilato.
- Prima di introdurre dipendenze runtime, verifica se la stessa esigenza puo' essere gestita nella webview o con API native di VS Code.
- Mantieni il file `.seqdiag` come source of truth; il renderer remoto non deve diventare il sistema di persistenza.
- Se aggiungi supporto a file custom o rendering remoto, documenta subito limiti, requisiti di rete e comportamento offline nel `README.md`.
- Preferisci comandi utente espliciti e configurazioni minime; evita automazioni che possano inviare contenuto verso servizi esterni senza consenso chiaro.
- A fine iterazione, crea sempre un commit Git che includa il lavoro svolto in quel turno.
- Mantieni la suite di test e il watchdog coerenti con l'architettura reale dell'estensione; evita test che dipendono dal servizio pubblico quando esiste un fake renderer locale.

## Agent Handoff

- Aggiorna `README.md` quando cambi setup, comandi o flussi utente.
- Aggiorna `CHANGELOG.md` per modifiche visibili o di setup rilevanti.
- Se estendi la webview, mantieni la logica HTML/JS isolata da custom editor, comandi e adapter renderer.
