# Materialities of AI: reverse engineering as a lens

Mappa interattiva (D3, nessuna build) che collega dimensioni di ricerca, sotto-temi e casi studio reali sulle materialità dell'AI: ambiente, risorse e infrastrutture, persone e lavoro, embodiment ed economia, con il reverse engineering come lente.

Ogni caso ha un riassunto breve, l'evidenza (misurata, riportata, accusa, ecc.), gli attori, il legame con la materializzazione dell'AI e uno o due link alla fonte.

## Come funziona

- Passa il mouse su un pallino (o toccalo su smartphone) per il riassunto; clicca per aprire la fonte in una nuova scheda.
- I filtri in alto isolano le dimensioni; "Reverse-engineering cases only" evidenzia i casi con l'anello.
- Trascina i nodi, zoom con rotella o pizzico.

## Struttura

| File | Contenuto |
|---|---|
| `index.html` | Pagina e struttura |
| `style.css` | Stili, anche per tema scuro |
| `data.js` | **Dati**: dimensioni `D`, sotto-temi `S`, casi `K` |
| `app.js` | Logica della mappa |
| `.github/workflows/pages.yml` | Pubblicazione automatica su GitHub Pages |

## Pubblicarla su GitHub Pages

1. Crea un nuovo repository su GitHub (per esempio `materialities-map`) e carica tutti i file di questa cartella, inclusa `.github`.
2. Vai su **Settings → Pages** e in **Build and deployment → Source** scegli **GitHub Actions**.
3. Fai un commit su `main` (o lancia il workflow da **Actions → Deploy to GitHub Pages → Run workflow**).
4. Dopo circa un minuto il sito è online su `https://TUO-UTENTE.github.io/NOME-REPO/`.

Alternativa senza Actions: **Settings → Pages → Deploy from a branch → main / (root)**.

## Provarla in locale

```bash
python3 -m http.server 8000
# poi apri http://localhost:8000
```

(Aprire `index.html` con doppio clic funziona in genere, ma un piccolo server evita problemi con alcuni browser.)

## Aggiungere un caso studio

In `data.js`, aggiungi un oggetto all'array `K`:

```js
{id:'esempio',            // unico
 n:`Titolo breve`,
 s:'o2',                  // sotto-tema principale (id in S)
 x:['p2'],                // facoltativo: altri sotto-temi collegati
 re:1,                    // facoltativo: 1 se il reverse engineering è il fenomeno
 t:`Tipo di evidenza`,
 w:`Attori coinvolti`,
 d:`Prima frase = riassunto breve. Poi i dettagli.`,
 ai:`Legame con la materializzazione dell'AI`,
 src:`Nome fonte`, u:`https://...`,
 u2:`https://...`, s2:`Seconda fonte`}   // facoltativi
```

Per un nuovo sotto-tema aggiungi un oggetto a `S` con `p` uguale all'id di una dimensione (`env`, `res`, `ppl`, `emb`, `eco`).

## Note sulle fonti

La maggior parte delle fonti è stampa o analisi di terzi, non documenti primari. Controlla le etichette di evidenza e verifica i dati prima di citarli. Alcuni casi riguardano Anthropic, che è parte in causa: sono segnalati.

## Licenza

Scegli una licenza prima di pubblicare (per esempio MIT per il codice, CC BY 4.0 per i contenuti). Le fonti restano di proprietà dei rispettivi autori.
