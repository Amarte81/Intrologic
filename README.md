# Intrologic

Un gioco di logica e programmazione visuale con puzzle a blocchi, fruibile direttamente dal browser senza plugin o dipendenze esterne.

## 🤖 Caratteristiche
- **Grafica Isometrica 3D**: Rendering dinamico canvas con proiezione isometrica reale e ordinamento di profondità (Painter's Algorithm).
- **Robottino WALL-E**: Modello geometrico 3D con cingoli, binocolo/occhi luminosi, pannelli solari e rotazione continua su tutti i punti cardinali.
- **20 Livelli**:
  - **Basics** (8 livelli): sequenze di comandi lineari, svolte, salti e lampadine.
  - **Procedures** (6 livelli): uso di routine `P1` e `P2` per ottimizzare le istruzioni.
  - **Loops** (6 livelli): ricorsione e loop infiniti con terminazione automatica al successo.
- **Controlli di Esecuzione**:
  - Modalità **Esegui** (esecuzione continua animata).
  - Modalità **Passo** (esecuzione passo-passo per debug).
  - Finestra di **Missione Fallita** non invasiva e pulsante **Rigioca** a fine livello.
  - Descrizioni comandi su hover.
- **Salvataggio Progressi su Dispositivo**:
  - Tracciamento automatico dei livelli superati (`X/20 ★`) con spunte visive nel selettore livelli.
  - Salvataggio delle soluzioni impostate per ciascun livello e ripristino dell'ultimo livello giocato tramite `localStorage`.
  - Opzione per azzerare i progressi in qualsiasi momento.

## 🚀 Gioca online
Puoi giocare direttamente tramite **GitHub Pages**:
[https://amarte81.github.io/Intrologic/](https://amarte81.github.io/Intrologic/)

## 💻 Esecuzione locale
Apri semplicemente il file `index.html` in qualsiasi browser moderno (Chrome, Edge, Firefox, Safari). Non è richiesto alcun server web locale né Node.js.
