# Lightbot - WALL-E 3D Rewrite Complete

## Novità nell'implementazione
Ho appena ricostruito l'intero sistema di rendering del robottino da zero in `game.js`, passando a un vero e proprio motore 3D isometrico generato via codice, senza bisogno di immagini o file esterni.

### 1. Modello 3D di WALL-E
Il robottino è ora composto da solidi geometrici 3D (Cubi/Parallelepipedi) inseriti in uno spazio locale:
- **Corpo Centrale**: squadrato e massiccio, con logo rosso e indicatori LED verdi per la batteria/pannello solare sulla faccia frontale.
- **Cingoli**: due blocchi laterali distinti e larghi, tipici di WALL-E.
- **Collo e Occhi**: un collo sottile che sorregge i due obiettivi fotografici tipici di WALL-E. Hanno lenti celesti luminescenti frontali.
- **Braccia**: due piccole braccia laterali.

### 2. Rotazione Continua e Coerente (Motore Matematico)
La critica principale era che "deve essere chiara la direzione in cui è posizionato".
- Ho implementato una matrice di rotazione continua attorno all'asse Z locale.
- Il robottino non "sostituisce immagini" per girarsi, ma ruota gradualmente i suoi vertici 3D. 
- Il fronte è sempre inconfutabilmente il fronte (dove ci sono gli occhi e i led), e si adatta perfettamente alla griglia isometrica. Se si ruota di 90 gradi, si vedrà il robot fisicamente e dolcemente cambiare angolazione.
- Questo sistema risolve al 100% l'ambiguità direzionale in ogni istante di gioco.

### 3. Depth Sorting e Backface Culling (Painter's Algorithm)
- Tutti i poligoni (le facce dei cubi) calcolano la loro normale tramite prodotto vettoriale e si nascondono automaticamente (Backface Culling) se non sono visibili dalla telecamera isometrica.
- Successivamente, tutti i poligoni visibili (sia del robot che dei cubi della mappa) vengono ordinati per profondità per garantire che i pezzi si sovrappongano correttamente. 

### 4. Animazioni Sinergiche
- **Camminata**: I cingoli mantengono l'assetto mentre il corpo e le braccia si muovono.
- **Salto**: Utilizza la deformazione "Squash and Stretch" (schiacciamento) applicata sull'asse Z del modello 3D, deformando perfettamente il robottino intero come una palla da basket.
- **Accensione Lampadina**: Gli occhi (binoculars) effettuano un "tilt" (pitch up) verso l'alto per guardare il blocco, e da essi scaturisce un vero fascio di luce gialla verso il pavimento per illuminare il tile target!

## Come testare
Apri semplicemente il file `index.html` aggiornato su Edge o Chrome (anche offline con `file://`).
Tutto funzionerà istantaneamente e ad alte prestazioni tramite HTML5 Canvas.
