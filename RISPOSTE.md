# RISPOSTE.md

Risposte alle domande di verifica delle due dispense del **Modulo 03 · Angular**:

- **LAB 03.14** — *Servizi: il registro degli studenti* (domande 1-10, richieste
  dalla sezione «Domande a cui rispondere» del laboratorio);
- **TEO 03.13** — *I servizi e la dependency injection* (domande 1-12 della
  sezione «Domande di verifica» della dispensa).

I due progetti di questo repository sono `projects/registro-studenti` (LAB 03.14)
e `projects/hamburgeria` (TEO 03.13). Si avviano con `ng serve registro-studenti`
e `ng serve hamburgeria`.

---

# Parte 1 — LAB 03.14 «Il registro degli studenti»

## 1. Che cos'è `app.routes.ts` e che cosa contiene in questo progetto? Elenca gli URL e il componente che mostrano.

`app.routes.ts` è il file che contiene la **tabella delle route** dell'applicazione: un array di oggetti in cui ogni elemento associa un *percorso URL* a un *componente*. È il "centralino" del router: quando l'URL del browser cambia, Angular cerca la prima route che corrisponde e disegna quel componente dentro `<router-outlet />`. Il file esporta una costante (`export const routes: Routes`) che viene passata a `provideRouter(routes)` in `app.config.ts`.

In questo progetto contiene:

| URL | Componente mostrato | Note |
| --- | --- | --- |
| `''` | — (redirect a `home`) | `pathMatch: 'full'`, altrimenti scatterebbe per qualunque URL |
| `/home` | `Home` | il riquadro grande con «Studenti registrati: N» e la card della media più alta |
| `/elenco` | `Elenco` | la tabella filtrabile |
| `/inserimento` | `Inserimento` | il form di un nuovo studente |
| `/elenco/:id` | `DettaglioStudente` | la scheda di uno studente; `:id` è un **parametro** |
| `/modifica/:id` | `ModificaStudente` | la prova in autonomia di livello 3 |
| `**` | — (redirect a `home`) | la *wildcard*: cattura qualunque URL non riconosciuto |

Due dettagli che contano: il redirect da `''` ha `pathMatch: 'full'` perché il percorso vuoto è un prefisso di *tutti* gli URL, e le route con parametro stanno **prima** della wildcard, altrimenti `**` le catturerebbe per prime (le route si valutano dall'alto in basso).

## 2. Che cos'è un service e perché lo si usa? Perché gli studenti stanno in `StudentiService` e non nel componente `Elenco`?

Un **service** è una normale classe TypeScript che contiene dati e logica **condivisi** fra più componenti. Angular ne crea una sola istanza per tutta l'applicazione (è un **singleton**) e la consegna a chi la chiede con `inject()`. Si usa quando un dato deve sopravvivere alla navigazione o essere visto da più pagine contemporaneamente.

Gli studenti stanno in `StudentiService` perché:

1. **Ogni pagina deve vedere gli stessi dati.** Home mostra il *numero* di studenti, Elenco la *tabella*, Inserimento ne *crea* di nuovi, Dettaglio ne mostra *uno*. Se i dati stessero in `Elenco`, la Home non avrebbe modo di sapere quanti studenti ci sono.
2. **Il router distrugge i componenti quando cambi pagina.** Quando lasci `/elenco`, il componente `Elenco` viene distrutto e tutto ciò che stava nelle sue proprietà va perso: al ritorno troveresti i cinque studenti iniziali e le modifiche sparite. Il servizio invece vive finché vive l'app.
3. **I componenti non sono padre e figlio tra loro.** Le pagine mostrate nel `<router-outlet />` non compaiono come tag nel template del padre, quindi non ricevono input e non possono emettere output verso di lui: il passaparola di input/output non è praticabile. Serve un punto di incontro esterno: il servizio.
4. **La logica sta in un posto solo.** La regola «l'id di un nuovo studente è il massimo esistente + 1» è scritta una volta sola, nel servizio. Nessun componente può sbagliarla o aggirarla.

## 3. Come si legge l'`id` dello studente dall'URL? Perché va convertito con `Number`?

Si legge con `ActivatedRoute`, il servizio che rappresenta la route attiva:

```ts
this.route.paramMap.subscribe(parametri => {
  const id = Number(parametri.get('id'));
  // ...
});
```

`paramMap` è una mappa dei parametri della route (`:id` nel nostro caso) e `get('id')` restituisce il valore. Va convertito con `Number(...)` perché **`paramMap.get()` restituisce sempre una `string`** (`'2'`, non `2`): il tipo dichiarato è infatti `string | null`. Il metodo `trova` del servizio confronta con `===`:

```ts
this.dati().find(s => s.id === id)
```

`===` non fa conversioni di tipo, quindi `2 === '2'` è `false`. Senza `Number(...)` il confronto fallirebbe per **ogni** studente e il dettaglio rimanderebbe sempre all'elenco. Con `Number(...)` la stringa diventa il numero `2` e il confronto funziona.

## 4. Perché il signal `dati` è privato e i componenti leggono `studenti`? Che cosa potrebbe succedere se `Elenco` potesse chiamare `set` sul signal?

`dati` è `private` perché è lo **stato scrivibile**: `private` significa che solo il codice dentro `StudentiService` può chiamare `dati.set(...)` o `dati.update(...)`. I componenti ricevono `studenti`, che è `this.dati.asReadonly()`: un signal che si può **leggere** (`studenti()`) ma che **non ha** i metodi `set` e `update`. È lo stesso principio dei campi privati con metodi pubblici che si usa in Java: si espone la lettura, si controlla la scrittura.

Se `Elenco` potesse chiamare `set` sul signal, le **regole del registro si romperebbero**, perché sarebbero aggirabili da qualunque componente:

- un componente potrebbe sostituire l'intera lista con un array di studenti senza id, o con id duplicati;
- `prossimoId()` smetterebbe di funzionare, perché il calcolo «massimo + 1» presuppone che nessuno introduca id a caso: due studenti potrebbero avere lo stesso id e il dettaglio mostrerebbe quello sbagliato;
- i `computed` derivati (`numero`, `migliore`) darebbero risultati incoerenti rispetto ai dati reali;
- la logica di validazione (classe in maiuscolo, media numerica) verrebbe saltata, perché sta in `aggiungi`;
- il giorno in cui i dati arriveranno da un server, ogni componente dovrebbe sapere *come* parlarci: una modifica al protocollo richiederebbe di toccare tutti i componenti invece di un solo servizio.

## 5. Come viene calcolato l'id di un nuovo studente? Mostra con un esempio perché «numero di studenti + 1» sarebbe sbagliato.

```ts
private prossimoId(): number {
  return Math.max(0, ...this.dati().map(s => s.id)) + 1;
}
```

Si prende il **massimo degli id esistenti** e si aggiunge 1. `Math.max(0, ...)` gestisce anche il caso di lista vuota: `Math.max()` senza argomenti restituirebbe `-Infinity`, quindi lo `0` iniziale serve da rete di sicurezza. `aggiungi` usa questo valore per il nuovo studente e poi accoda la copia dell'array con `update`.

**Esempio concreto (quello della traccia).** Partiamo dai cinque studenti iniziali, con id 1, 2, 3, 4, 5.

1. Elimino lo studente con id 2 (`rimuovi(2)`): restano gli id **1, 3, 4, 5** — quattro studenti.
2. Inserisco un sesto studente.
   - Con la regola sbagliata «numero di studenti + 1»: `4 + 1 = 5`. Ma **l'id 5 è già usato** da Paolo Russo! Ora due studenti diversi hanno id 5.
   - Con la regola corretta «massimo + 1»: `Math.max(1, 3, 4, 5) + 1 = 6`. Nessun conflitto.

Il problema si aggrava con le eliminazioni successive: la regola sbagliata riusa id già esistenti, e `trova(id)` (che si ferma al primo `find`) mostrerebbe sempre lo studente sbagliato. Il difetto si vede nella tabella, dove comparirebbero due righe con lo stesso id, e nel dettaglio, che aprirebbe sempre la stessa scheda per due studenti diversi.

## 6. Che cosa succede, passo per passo, quando scrivi una lettera nel campo del filtro?

Il campo è collegato con `[(ngModel)]="filtroClasse"` al signal `filtroClasse`, e `filtrati` è un `computed` che legge sia `filtroClasse` sia il signal `studenti` del servizio. Premendo un tasto:

1. **L'utente preme il tasto** (per esempio `4`, poi `a`) dentro `<input [(ngModel)]="filtroClasse">`.
2. **Angular aggiorna il signal**: `[(ngModel)]` è la combinazione di `[ngModel]` e `(ngModelChange)`; quest'ultimo scrive il nuovo testo nel signal, quindi `filtroClasse` vale `'4a'`. Il valore scorre dall'HTML verso TypeScript.
3. **Il `computed` viene invalidato**: Angular sa che `filtrati` dipende da `filtroClasse`, quindi lo marca come "da ricalcolare". Non lo ricalcola subito: lo fa alla prossima lettura (è *lazy*).
4. **Il template rilegge `filtrati()`** durante il rendering: il `computed` si esegue e restituisce il nuovo elenco. Dentro fa `trim()` e `toUpperCase()`, quindi `'4a'` diventa `'4A'`; poiché il filtro non è vuoto, usa `tutti.filter(s => s.classe.toUpperCase() === filtro)`. Il `toUpperCase()` anche sul lato dati rende il confronto tollerante: `4a` e `4A` trovano gli stessi studenti.
5. **Il `@for` ridisegna le righe**: scorre `visibili()`, il `computed` che parte da `filtrati()` e applica l'eventuale ordinamento scelto con i pulsanti «Per nome» / «Per media» (signal `ordine`); grazie a `track s.id` riusa le righe che restano invece di ricostruire tutto. Con `4a` restano solo Marco Verdi e Giulia Neri; le altre righe scompaiono.
6. **Il `@if` esterno aggiorna lo stato vuoto**: se `filtrati().length === 0` compare l'avviso giallo. Il blocco interno distingue due casi: con un filtro attivo mostra «Nessuno studente trovato per la classe 4X», senza filtro mostra «Il registro è vuoto.»
7. **La media di classe si aggiorna**: `mediaClasse` è un altro `computed` che legge `filtrati()`, quindi si ricalcola a sua volta e la riga sotto la tabella mostra il nuovo valore con due decimali (con `4A`: `7.30`).
8. **Cancellando il filtro** (`filtroClasse` torna `''`) la `computed` restituisce l'elenco completo: ricompaiono tutti e cinque gli studenti.

L'aspetto importante è che **non c'è nessuna chiamata esplicita ad "aggiorna la tabella"**: il legame è dichiarato una volta sola nel `computed` e Angular lo rispetta a ogni cambiamento. Il campo non sta dentro un `<form>`, quindi non serve l'attributo `name`.

## 7. A che cosa servono `#modulo="ngForm"` e `[disabled]="modulo.invalid"`? Quali condizioni rendono il form non valido?

`#modulo="ngForm"` è una **variabile di template**: crea un nome (`modulo`) utilizzabile nel resto del template, ma — attenzione — non punta all'elemento HTML `<form>`: `ngForm` è la *direttiva* che Angular applica ai form template-driven, quindi `modulo` è l'oggetto che **controlla** il form. Quell'oggetto espone lo stato del form e dei suoi campi: `valid`, `invalid`, `dirty`, `touched`, `value`, e la collezione `controls`.

`[disabled]="modulo.invalid"` usa quello stato per disabilitare il pulsante Salva: `modulo.invalid` è `true` quando almeno un campo viola le sue regole, quindi finché il form non è valido il pulsante è grigio e non cliccabile. È un binding di proprietà (le quadre), non un attributo: il valore viene rivalutato a ogni cambiamento del form.

Un dettaglio obbligatorio: **dentro un `<form>`, ogni campo con `[(ngModel)]` deve avere l'attributo `name`** (nel nostro caso `name="nome"`, `name="classe"`, `name="media"`). Angular usa il `name` come chiave per registrare il campo nel form; senza, la console segnala `NG01352: If ngModel is used within a form tag, either the name attribute must be set...` e il form non traccia quel campo.

Le condizioni che rendono il form non valido sono quelle dichiarate sui campi:

- `required` su **nome**, **classe** e **media** → il campo è obbligatorio; se è vuoto il form è invalido. È il caso «nome vuoto» del risultato atteso;
- `min="1"` e `max="10"` su **media**, che è `type="number"` → il valore deve stare nell'intervallo 1-10. È il caso «media di 11» del risultato atteso: il form è invalido e il pulsante resta disabilitato;
- `step="0.1"` dichiara l'incremento consentito per il campo numerico.

Nota: `min`/`max` non impediscono *fisicamente* la scrittura di `11`, ma rendono il controllo **non valido**, che è esattamente ciò che serve perché `[disabled]` blocchi il salvataggio.

## 8. Perché dopo il salvataggio si usa `router.navigate(['/elenco'])` invece di un link?

Perché la navigazione non è una **scelta dell'utente**, è la **conseguenza dell'azione** di salvataggio. Un link richiede un click su un elemento della pagina; qui non c'è nulla da cliccare: l'utente preme Salva e l'app deve portarlo all'elenco da sola, dopo aver eseguito il salvataggio. Con `Router` iniettato, `salva()` esegue in sequenza:

```ts
this.studentiService.aggiungi(this.nome().trim(), this.classe().trim().toUpperCase(), Number(this.media()));
this.router.navigate(['/elenco']);
```

Si notano due vantaggi:

1. **Il controllo dell'ordine delle operazioni.** Prima si salva, poi si naviga. Con un link `<a routerLink="/elenco">` il click navigherebbe *invece* di salvare, o al massimo bisognerebbe annidare un link dentro il pulsante di submit, con comportamenti fragili.
2. **La navigazione passa dal router**, quindi è una vera navigazione dell'applicazione (nessun ricaricamento della pagina) e resta coerente con la cronologia del browser: il tasto "indietro" torna alla pagina precedente, non ricarica il form.

Inoltre `router.navigate()` accetta un array di segmenti, quindi lo stesso meccanismo funziona con parametri: nel dettaglio, `this.router.navigate(['/elenco', prossimo.id])` porta a `/elenco/3`. È anche il modo in cui il dettaglio rimanda all'elenco quando lo studente non esiste (`/elenco/99`) o dopo una rimozione: in quei casi un link non avrebbe senso, perché la pagina deve *reagire* a una condizione dei dati.

## 9. Quali input e quale output ha `StudenteCard`? Perché la card non chiama direttamente il servizio per rimuovere lo studente?

`StudenteCard` ha **due input** e **un output**:

| Membro | Dichiarazione | Significato |
| --- | --- | --- |
| `studente` | `readonly studente = input.required<Studente>()` | **input obbligatorio**: lo studente da mostrare. `required` significa che il padre *deve* passarlo, altrimenti la compilazione lo segnala |
| `azioni` | `readonly azioni = input(true)` | **input facoltativo** con valore predefinito `true`: se il padre non lo passa, la card mostra il pulsante |
| `rimosso` | `readonly rimosso = output<Studente>()` | **output**: l'evento che la card emette quando si preme il pulsante, trasportando lo studente |

Il pulsante non rimuove nulla da solo: esegue solo `this.rimosso.emit(this.studente())`. È il **padre** a decidere che cosa fare, e i due padri fanno cose diverse: nella Home la card viene usata con `[azioni]="false"` (solo lettura, nessun pulsante), nel dettaglio con `(rimosso)="rimuovi($event)"`, dove `rimuovi` chiama il servizio e poi naviga all'elenco.

La card non chiama direttamente il servizio perché sarebbe un **componente che sa troppo**. Oggi la stessa card serve due pagine con comportamenti diversi; se chiamasse il servizio per rimuovere:

- **non sarebbe più riutilizzabile**: nella Home, dove lo studente mostrato è solo un'informazione, il pulsante (se presente) eliminerebbe davvero qualcuno;
- **perderebbe autonomia**: diventerebbe dipendente da `StudentiService` e da `Router`, quindi non si potrebbe più usarla in un altro contesto (una pagina di sola consultazione, un test, un'altra parte dell'app);
- **il comportamento sarebbe sparso**: la decisione «dopo la rimozione torno all'elenco» finirebbe dentro la card, mentre è una scelta della pagina. Se una seconda pagina volesse restare dov'è dopo la rimozione, la card glielo impedirebbe;
- **i test diventerebbero più difficili**: una card "pura" si verifica passando un input e controllando l'output emesso, senza dover simulare un servizio e un router.

È il principio dei componenti "stupidi" (presentazionali) che espongono eventi e lasciano al contenitore la logica: la card **sa mostrare**, il padre **sa cosa fare**.

## 10. Perché «Studente successivo» funziona solo con `paramMap.subscribe`? Che cosa vedresti con lo snapshot?

Perché passando da `/elenco/2` a `/elenco/3` **l'URL cambia ma la route è la stessa**. Angular ha una regola precisa: se il componente associato a una route resta lo stesso, il componente viene **riusato**, non distrutto e ricreato. Di conseguenza `ngOnInit` **non viene rieseguito**: si esegue una sola volta, quando il componente viene creato la prima volta (cioè quando si arriva da `/elenco`).

`paramMap` è un **Observable**: emette un nuovo valore a ogni cambiamento dei parametri, anche quando il componente è riusato. Sottoscrivendosi con `paramMap.subscribe(...)`, il codice viene rieseguito a ogni passaggio:

```ts
ngOnInit(): void {
  this.route.paramMap.subscribe(parametri => {
    const id = Number(parametri.get('id'));
    const trovato = this.studentiService.trova(id);
    if (trovato) {
      this.studente.set(trovato);   // studente è un signal => il template si aggiorna
    } else {
      this.router.navigate(['/elenco']);
    }
  });
}
```

Servono **entrambe** le condizioni, ed è esattamente ciò che dice la tabella degli errori comuni della traccia:

1. leggere il parametro con `paramMap.subscribe` (non con lo snapshot), **e**
2. conservare lo studente in un **signal** (`studente.set(...)`), non in una proprietà semplice.

Con lo **snapshot** (`this.route.snapshot.paramMap.get('id')`) il valore viene letto *una volta sola*, al momento della creazione del componente. Premendo «Studente successivo»:

- `router.navigate(['/elenco', prossimo.id])` cambia davvero l'**URL** (la barra degli indirizzi passa da `/elenco/2` a `/elenco/3`, e il tasto indietro funziona);
- ma `ngOnInit` **non viene rieseguito**, quindi la lettura dello snapshot non avviene di nuovo;
- `studente` resta quello di prima e la scheda **non cambia**: vedresti l'URL aggiornato e la pagina ferma sullo studente precedente. È il sintomo descritto dalla traccia: «Studente successivo cambia l'URL ma non la scheda».

Nota: se invece lo studente fosse in una proprietà semplice aggiornata dentro la `subscribe`, il valore cambierebbe lato TypeScript ma il template **non si ridisegnerebbe**, perché Angular non sa che quella proprietà è cambiata. Il signal è ciò che rende visibile il cambiamento alla vista.

---

## Appendice — La domanda della «Prova tu» livello 3: «Qui lo snapshot va bene: perché?»

La domanda sta accanto al link `[routerLink]="['/modifica', s.id]"` dell'elenco e riguarda il componente `ModificaStudente`, che in `ngOnInit` legge l'id con `this.route.snapshot.paramMap.get('id')` — cioè con lo snapshot, non con `paramMap.subscribe`.

Lo snapshot qui va bene **perché questa pagina non ha nessun comando che cambi l'id restando sulla stessa route**. Si arriva a `/modifica/3` da un link dell'elenco: il router non riusa il componente di un'altra pagina, quindi `ModificaStudente` viene creato da zero e `ngOnInit` viene rieseguito a ogni ingresso. Lo snapshot, letto *dentro* `ngOnInit`, contiene perciò sempre l'id giusto. Anche il salvataggio non crea il problema: `aggiorna` naviga altrove (`/elenco/3`), quindi la pagina di modifica viene distrutta.

Il caso del dettaglio è l'opposto ed è il motivo per cui la traccia le distingue:

| | Dettaglio (`/elenco/:id`) | Modifica (`/modifica/:id`) |
| --- | --- | --- |
| Si naviga da `/elenco/2` a `.../3` restando sulla stessa route? | **Sì**: il pulsante «Studente successivo» | **No**: si arriva solo da un link dell'elenco |
| Angular riusa il componente? | Sì | No, lo ricrea |
| `ngOnInit` viene rieseguito? | **No** | Sì |
| Lettura del parametro | `paramMap.subscribe` (obbligatorio) | `snapshot` (sufficiente) |

La regola da portarsi via è quindi condizionata: lo snapshot è corretto **finché il componente viene sempre ricreato**. Se un domani si aggiungesse anche nella modifica un pulsante «Modifica lo studente successivo», il componente verrebbe riusato e lo snapshot resterebbe fermo sull'id precedente: in quel momento andrebbe convertito a `paramMap.subscribe`, esattamente come nel dettaglio.

---

# Parte 2 — TEO 03.13 «I servizi e la dependency injection»

## 1. Perché il messaggio «Hai scelto» del laboratorio 03.12 spariva cambiando pagina? Dove avresti dovuto conservarlo?

Spariva perché quel messaggio stava in una **proprietà o in un signal di un componente**, e il router, quando cambi pagina, **distrugge il componente che lasci** e ne crea uno nuovo quando torni. Tutto ciò che viveva nelle sue proprietà e nei suoi signal viene perso con lui: il nuovo componente nasce con i valori iniziali, quindi il messaggio non c'è più. Non è un bug: è il ciclo di vita previsto dei componenti.

Avrei dovuto conservarlo **fuori dai componenti**, in un **servizio** con stato condiviso (`@Service()`), per esempio `SceltaService` con un signal privato `scelta` esposto in sola lettura con `asReadonly()`. Il servizio vive nell'iniettore radice, quindi non viene distrutto quando si cambia pagina: entrambi i componenti (quello della scelta e quello della frutta) leggono lo stesso signal e vedono lo stesso valore. In alternativa, se il dato dovesse sopravvivere anche a un **F5**, servirebbe una persistenza esterna al processo dell'app: `localStorage` o un server.

## 2. Che cos'è un servizio? Fai due esempi di dati che conviene tenere in un servizio invece che in un componente.

Un servizio è una **normale classe TypeScript** che contiene dati e logica **da condividere** fra più componenti. Angular ne crea **una sola istanza** per tutta l'applicazione (singleton) e la consegna a ogni componente che la chiede con `inject()`. Si genera con la CLI (`ng g s services/nome-service`), si decora con `@Service()` (Angular 22) o `@Injectable({ providedIn: 'root' })`, e si mette di solito in `src/app/services/`.

Due esempi di dati che conviene tenere in un servizio:

1. **Il carrello / l'ordine di un e-commerce** (o l'ordine dell'hamburgeria di questa dispensa): la pagina del menu aggiunge prodotti, la pagina del riepilogo li mostra, la barra in alto conta i pezzi. Sono tre componenti che non sono padre e figlio tra loro e che devono vedere lo **stesso** ordine: è il caso d'uso da manuale del servizio. Lo stesso vale per i preferiti, il confronto prodotti, il totale speso.
2. **L'utente collegato e i suoi permessi** (sessione, token, nome visualizzato nella barra): serve alla barra di navigazione, alle pagine protette, a ogni componente che mostra «Ciao, nome». Se stesse in un componente, al primo cambio pagina l'utente risulterebbe disconnesso.

Altri esempi altrettanto validi: i dati che arrivano da un server (una lista di studenti, un catalogo), le preferenze di interfaccia (tema chiaro/scuro, lingua), un contatore condiviso, la cache di una ricerca.

## 3. Che file crea `ng g s services/carrello-service` e come si chiama la classe? Perché aggiungiamo il suffisso `-service`?

Il comando crea **due file** in `src/app/services/`:

- `carrello-service.ts` — il servizio vero e proprio;
- `carrello-service.spec.ts` — il file di test generato automaticamente dalla CLI.

La classe si chiama **`CarrelloService`**: la CLI trasforma il nome in *PascalCase* e aggiunge il suffisso `Service`.

Aggiungiamo il suffisso `-service` perché altrimenti il nome della classe sarebbe ambiguo. Con `ng g s services/carrello` la classe si chiamerebbe **`Carrello`**, un nome che non dice *che cos'è*: potrebbe sembrare un modello (`interface Carrello`) o un componente (`CarrelloComponent`). Nel codice si leggerebbe `inject(Carrello)`, e chi legge non saprebbe se sta iniettando un servizio o importando un tipo di dato. Il suffisso rende esplicito il ruolo della classe e la distingue dalle altre due famiglie di nomi (`Piatto` per i modelli, `Menu`/`Riepilogo` per i componenti). In più, è una convenzione che si ritrova in tutta la documentazione Angular: `HttpClient`, `Router`, `ActivatedRoute` seguono lo stesso schema.

## 4. Che relazione c'è tra `@Service()` e `@Injectable({ providedIn: 'root' })`? Che errore ottieni se usi `@Injectable()` senza `providedIn`?

Sono **due forme equivalenti** per lo stesso scopo: dichiarare che una classe è un servizio disponibile in tutta l'applicazione.

- `@Service()` è la forma introdotta con **Angular 22**: dice «questa classe è un servizio, disponibile in tutta l'app». Accetta anche opzioni: `@Service({ autoProvided: false })` per registrarlo a mano in un `providers`, e `@Service({ factory: () => ... })` per creare il valore con una funzione.
- `@Injectable({ providedIn: 'root' })` è la forma **classica**, che funziona ancora ed è equivalente: `providedIn: 'root'` significa «registra il servizio nell'iniettore **radice**», cioè a livello di tutta l'applicazione. Da qui nasce l'unica istanza condivisa (il singleton).

Nella documentazione, nei tutorial e nei progetti scritti prima di Angular 22 troverai quasi sempre la seconda forma: è per questo che la dispensa le presenta insieme.

**Se usi `@Injectable()` senza `providedIn`**, il servizio **non è registrato da nessuna parte**: diventa una classe decorata ma "invisibile" all'iniettore. Chi prova a ottenerla con `inject()` riceve l'errore:

```
NG0201: No provider found for NomeDelServizio
```

Per farlo funzionare bisogna registrarlo **a mano** nell'array `providers` di un componente o della configurazione dell'applicazione (`app.config.ts`). La regola pratica: se vuoi il singleton condiviso da tutta l'app, usa `@Service()` oppure `@Injectable({ providedIn: 'root' })`; `@Injectable()` da solo ha senso solo quando il servizio deve avere una **visibilità limitata** (per esempio un provider locale a un componente, con una istanza diversa per ogni componente).

Un'attenzione specifica della nostra dispensa: dentro una classe `@Service()` **non si può usare l'iniezione via costruttore**, altrimenti la compilazione si ferma con `NG2028: @Service class cannot use constructor dependency injection.` Per questo nei nostri progetti usiamo sempre `inject()` nei campi, che funziona ovunque.

## 5. Che cosa significa «singleton»? Come verifichi che un servizio viene creato una sola volta?

**Singleton** significa «una sola istanza per tutta l'applicazione»: la prima volta che un componente chiede un servizio, l'iniettore lo **crea** e lo **conserva**; da quel momento, ogni richiesta successiva riceve **la stessa identica istanza**. Non è una convenzione che il programmatore deve rispettare: è l'iniettore che la garantisce, ed è il motivo per cui i dati condivisi funzionano. Senza il singleton, ogni componente avrebbe la sua copia e i dati non sarebbero più condivisi (è esattamente il problema di `new OrdineService()`).

Per verificarlo si usa la **Prova tu 1** di questa dispensa: aggiungere al servizio un costruttore senza parametri che esegue `console.log('OrdineService creato')`.

```ts
constructor() {
  console.log('OrdineService creato');
}
```

Poi si avvia l'app, si naviga più volte fra Menu e Riepilogo e si aggiungono piatti. Il messaggio compare **una sola volta sola**, all'avvio dell'applicazione (subito, in console), e **non ricompare** navigando: i componenti Menu, Riepilogo e App vengono distrutti e ricreati a ogni cambio pagina, ma il servizio no, perché vive nell'iniettore radice finché l'app è aperta. Ricaricando la pagina con **F5** il messaggio ricompare una volta, perché l'intero processo dell'app riparte da zero.

Il test automatico verifica lo stesso fatto in modo più rigoroso: `TestBed.inject(OrdineService)` chiamato due volte restituisce lo stesso oggetto, quindi `expect(a).toBe(b)` passa (è lo stesso riferimento, non due oggetti uguali).

## 6. Spiega con parole tue la dependency injection, usando un'analogia diversa da quella della presa elettrica.

**Analogia del ristorante.** Un cuoco non va al mercato a comprare le verdure, non alleva i polli e non costruisce il forno: **dichiara di che cosa ha bisogno** («per questo piatto mi servono pomodori, basilico e mozzarella») e la cucina glieli fa arrivare. Il cuoco non sa *chi* ha coltivato i pomodori né *quale* forno scalderà l'acqua: sa solo che, quando inizia a cucinare, tutto il necessario è già lì sul banco. Se il ristorante cambia fornitore di mozzarella, il cuoco non cambia una riga del suo lavoro.

La dependency injection funziona così: invece di costruirsi da sé i propri collaboratori, una classe **dichiara le proprie dipendenze** nella firma (o con `inject()`) e qualcun altro gliele procura. Nel nostro caso:

- il **cuoco** è il componente (o il servizio);
- gli **ingredienti** sono le dipendenze (per esempio `StudentiService`, oppure `HttpClient` che a sua volta è un servizio);
- la **cucina** è l'**iniettore** di Angular, il sistema che tiene il registro delle istanze e sa come costruirle;
- il **menu scritto dal cuoco** è `inject(StudentiService)` o `constructor(private ordine: OrdineService)`: una dichiarazione di bisogno, non una costruzione.

I tre vantaggi si vedono subito:

1. **Una sola istanza condivisa.** La cucina ha *una* dispensa, non una per cuoco: tutti i componenti che chiedono `OrdineService` ricevono lo stesso oggetto, e così l'ordine è davvero condiviso.
2. **Nessun `new` sparso.** Il cuoco non costruisce il forno: se un giorno il forno diventa elettrico, cambia la cucina, non il cuoco. Tradotto: se il servizio ha bisogno di `HttpClient`, è Angular a procurarglielo; con `new` dovresti costruire a mano l'intera catena, ovunque.
3. **Si può cambiare il fornitore.** Nei test si può passare alla cucina un ingrediente finto (un *fake* del servizio) senza toccare il cuoco: è il motivo per cui i test dell'ordine funzionano senza un vero server.

Il punto chiave: il cuoco **chiede**, non **crea**. È l'inversione del controllo rispetto a `new OrdineService()`, dove il componente si costruisce da sé ciò di cui ha bisogno.

## 7. Perché non si scrive `new OrdineService()` in un componente? Che cosa succederebbe ai dati?

Perché `new` **aggira l'iniettore** e con esso l'intero meccanismo dei servizi. `new OrdineService()` costruisce un oggetto **nuovo, privato, di proprietà di quel componente**:

```ts
// SBAGLIATO
private readonly ordine = new OrdineService();
```

Le conseguenze sui dati sono tre, tutte gravi:

1. **I dati non sarebbero più condivisi.** Ogni componente che scrive `new OrdineService()` avrebbe **la sua copia** del signal `righe`. Il badge nella barra (che usa una copia) resterebbe a 0 mentre il menu (che usa un'altra copia) aggiunge piatti. Sarebbero tre ordini diversi che si ignorano a vicenda: esattamente il problema che il servizio doveva risolvere.
2. **I dati sparirebbero cambiando pagina.** Poiché l'istanza apparterrebbe al componente, quando il router distrugge il componente (cambio pagina) l'oggetto verrebbe abbandonato con tutto il suo stato. Al ritorno, un `new` darebbe un servizio vuoto: l'ordine si azzererebbe a ogni navigazione.
3. **Non ci sarebbe più un unico punto per le regole.** Non ci sarebbe alcuna garanzia che esista *una* istanza: chiunque potrebbe creare la propria versione con regole diverse (per esempio un `aggiungi` che crea sempre una nuova riga invece di sommare le quantità), e nessuno potrebbe più ragionare sul comportamento dell'app.

C'è poi un problema tecnico: **un servizio può a sua volta avere dipendenze**. Nel caso di `HttpClient`, `new MenuService()` non basta: bisognerebbe costruire a mano anche `HttpClient` e tutto ciò che gli serve. Con la dependency injection è Angular a procurarle; con `new` dovresti farlo tu, e in ogni punto in cui crei il servizio.

Regola pratica: **per i servizi non si usa mai `new`**; si chiede l'istanza con `inject()` (o con il costruttore, dove consentito). `new` resta corretto per oggetti che sono *dati* e non servizi: per esempio è normale scrivere `new Date()`, o costruire un oggetto letterale come `{ id: 6, nome: '...' }`.

## 8. Scrivi le due forme per ottenere `OrdineService` in un componente. Quale delle due non funziona dentro una classe `@Service()`?

Le due forme per ottenere `OrdineService` in un **componente**:

```ts
// Forma 1 — inject() nelle proprietà (consigliata nei nostri progetti)
import { Component, inject } from '@angular/core';
import { OrdineService } from '../services/ordine-service';

@Component({ /* ... */ })
export class Menu {
  private readonly ordine = inject(OrdineService);
}
```

```ts
// Forma 2 — iniezione via parametro del costruttore
import { Component } from '@angular/core';
import { OrdineService } from '../services/ordine-service';

@Component({ /* ... */ })
export class Menu {
  constructor(private readonly ordine: OrdineService) {}
}
```

Angular legge il **tipo** del parametro del costruttore e passa l'istanza giusta: le due forme sono **equivalenti** nel comportamento. Quando la dipendenza serve al template, la proprietà si dichiara `readonly` ma **non** `private` (come in `Riepilogo`, che usa `ordine.elenco()` direttamente nell'HTML).

C'è una terza variante, utile per i servizi che hanno bisogno di altre dipendenze:

```ts
// Forma 3 — inject() dentro il campo di una classe @Injectable()
@Injectable({ providedIn: 'root' })
export class MenuService {
  private readonly http = inject(HttpClient);
}
```

**La forma che NON funziona dentro una classe `@Service()` è la Forma 2**, quella con il costruttore:

```ts
@Service()
export class OrdineService {
  // ERRORE in compilazione
  constructor(private readonly router: Router) {}
}
```

La compilazione si ferma con:

```
NG2028: @Service class cannot use constructor dependency injection.
```

Per questo la regola dei nostri progetti è: **usare sempre `inject()` nelle proprietà**, che funziona indistintamente nei componenti, nelle classi `@Injectable()` e nelle classi `@Service()`. Le due forme con costruttore e `inject()` restano equivalenti **nei componenti e nelle classi `@Injectable()`**; solo `@Service()` rifiuta il costruttore.

Attenzione a un errore vicino ma diverso: `inject()` **non si può chiamare dentro un metodo** (per esempio in un gestore di click). Lì non c'è un "injection context" e si ottiene `NG0203: inject() function must be called from an injection context such as a constructor, a factory function, a field initializer, ...`. Le dipendenze vanno dichiarate come proprietà `readonly` in cima alla classe.

## 9. A che cosa serve `asReadonly()`? Che cosa impedisce, e perché è utile?

`asReadonly()` è il metodo che, applicato a un signal scrivibile, restituisce un **signal di sola lettura**: si può leggere con `elenco()`, ma **non** ha i metodi `set` e `update`. È la traduzione in Angular del principio dei campi privati con metodi pubblici che si conosce da Java.

```ts
private readonly righe = signal<RigaOrdine[]>([]);   // scrivibile, privato
readonly elenco = this.righe.asReadonly();           // sola lettura, pubblico
```

**Che cosa impedisce, esattamente:**

- a un componente di chiamare `elenco.set([...])`, sostituendo l'intero contenuto dello stato con dati arbitrari;
- di chiamare `elenco.update(...)`, quindi di applicare trasformazioni non previste (righe senza piatto, quantità negative o zero, id duplicati);
- di **mutare lo stato senza passare dalle regole del servizio**: la regola «lo stesso piatto aggiunto due volte aumenta la quantità» vive in `aggiungi`, e con `set`/`update` sarebbe aggirabile;
- di introdurre **incoerenza fra i derivati**: `numeroPezzi`, `totale` e `piattoPiuOrdinato` sono `computed` che si fidano dello stato; se lo stato potesse essere scritto da fuori, i valori mostrati potrebbero non corrispondere ai dati reali.

**Perché è utile:**

1. **La modifica ha un solo punto di ingresso.** Chi vuole cambiare l'ordine deve usare `aggiungi`, `rimuovi`, `togliUno`, `svuota`: le regole stanno in un posto solo e sono impossibili da dimenticare.
2. **Il contratto è esplicito.** Leggendo la classe, `private readonly righe` dice «questo è lo stato interno» e `readonly elenco` dice «questo è ciò che offro al mondo». Chi legge non deve indovinare quali campi si possono toccare.
3. **Il refactoring è sicuro.** Il giorno in cui i dati arriveranno da un server (`HttpClient`), cambierà solo *dentro* il servizio: i componenti continuano a leggere `elenco()` e a chiamare i metodi, senza sapere da dove arrivano i dati.
4. **Non serve disciplina, serve il compilatore.** Con un array pubblico condiviso basterebbe un `ordine.push(...)` distratto per rompere la condivisione (i signal cambiano solo se si crea un nuovo riferimento). Con `asReadonly()` quel codice **non compila**: è il tipo a proteggere i dati, non la buona volontà.

## 10. Scrivi un metodo `aggiorna(id: number, nuovoPrezzo: number)` per un servizio che tiene un signal privato `piatti` di tipo `Piatto[]`, senza modificare l'array sul posto.

```ts
import { Service, signal } from '@angular/core';
import { Piatto } from '../modelli/piatto';

@Service()
export class MenuService {
  private readonly piatti = signal<Piatto[]>([]);
  readonly elenco = this.piatti.asReadonly();

  aggiorna(id: number, nuovoPrezzo: number): void {
    this.piatti.update(lista =>
      lista.map(p => (p.id === id ? { ...p, prezzo: nuovoPrezzo } : p))
    );
  }
}
```

Come funziona e perché così:

- **`update` invece di `set`**: `update` riceve la lista attuale e la sostituisce con quella restituita dalla funzione. `set` andrebbe bene solo se avessimo già la lista nuova in mano; `update` è la forma corretta quando la trasformazione dipende dallo stato corrente.
- **`map` invece di una modifica diretta**: `map` costruisce un **nuovo array**, lasciando intatto quello esistente. Una scrittura del tipo `lista.find(...).prezzo = nuovoPrezzo` modificherebbe l'array (e l'oggetto) **sul posto**: il riferimento del signal resterebbe lo stesso, quindi Angular **non se ne accorgerebbe** e la pagina non si aggiornerebbe. Con `map` il signal riceve un nuovo array e i `computed` che lo leggono si ricalcolano.
- **`{ ...p, prezzo: nuovoPrezzo }` invece di `p.prezzo = nuovoPrezzo`**: lo *spread* crea un **nuovo oggetto** per il piatto modificato, sempre per non mutare l'originale. Gli altri piatti restano gli stessi oggetti (nessuno spreco).
- **`p.id === id ? ... : p`**: si sostituisce **solo** il piatto con quell'id; se l'id non esiste, `map` restituisce la lista invariata, senza aggiungere nulla. È lo stesso comportamento di `aggiorna` che abbiamo aggiunto a `StudentiService` nella Prova tu di livello 3.
- **L'array di partenza non viene mai toccato**, quindi eventuali altre letture dello stato precedente restano valide (nessun "cambiamento a sorpresa"): è il principio di **immutabilità** che rende possibile il funzionamento dei signal.

Se il servizio dovesse segnalare «id non trovato», si può rendere esplicito l'esito controllando prima:

```ts
aggiorna(id: number, nuovoPrezzo: number): boolean {
  if (!this.piatti().some(p => p.id === id)) {
    return false;
  }
  this.piatti.update(lista =>
    lista.map(p => (p.id === id ? { ...p, prezzo: nuovoPrezzo } : p))
  );
  return true;
}
```

## 11. Ricaricando la pagina l'ordine si svuota. Perché? Quali soluzioni proporresti?

Perché **il servizio vive in memoria**, nel processo JavaScript della pagina, e ricaricare significa **far ripartire l'applicazione da zero**: il browser butta via tutto il contesto precedente (l'istanza unica di `OrdineService`, i suoi signal, i componenti) e riscarica l'app, che ricrea tutto con i valori iniziali. Il costruttore di `OrdineService` viene rieseguito e `righe` torna a `[]`. Non è un difetto: è il comportamento previsto, e la traccia stessa lo ricorda («Il servizio vive in memoria: è il comportamento previsto»).

Da notare la differenza con la **navigazione**: cambiando pagina con il router l'app *non* riparte, quindi il servizio sopravvive e i dati restano. Solo F5 (o chiudere e riaprire la scheda) azzera tutto. Attenzione: sopravvivere al F5 non è una proprietà del *servizio*, ma di un eventuale **storage esterno** che il servizio userebbe.

**Soluzioni, dalla più semplice alla più corretta:**

1. **`localStorage` (o `sessionStorage`)** — il servizio, dopo ogni modifica, salva l'ordine come JSON (`localStorage.setItem('ordine', JSON.stringify(this.righe()))`) e all'avvio lo rilegge nel signal iniziale. Vantaggi: sopravvive a F5, alla chiusura del browser (`localStorage`) e non richiede alcun backend. Svantaggi: è **per browser e per dispositivo** (l'ordine non segue l'utente su un altro PC), ha un limite di spazio (~5-10 MB), è leggibile e modificabile dall'utente, ha natura sincrona (blocca leggermente il thread) e non è adatto a dati sensibili. `sessionStorage` è la variante che dura solo la sessione della scheda.

2. **Un vero server con `HttpClient`** — è la soluzione corretta per un'app reale. Il servizio diventa il punto in cui si parla con l'API:

```ts
@Service()
export class OrdineService {
  private readonly http = inject(HttpClient);
  private readonly righe = signal<RigaOrdine[]>([]);
  readonly elenco = this.righe.asReadonly();

  carica(): void {
    this.http.get<RigaOrdine[]>('/api/ordine').subscribe(dati => this.righe.set(dati));
  }

  aggiungi(piatto: Piatto): void {
    this.http.post<RigaOrdine>('/api/ordine', { idPiatto: piatto.id }).subscribe(riga =>
      this.righe.update(lista => [...lista, riga])
    );
  }
}
```

   Vantaggi: l'ordine è dell'**utente** (non del browser), è condiviso fra dispositivi, sopravvive a qualunque ricaricamento e i dati sono validati dal server. È esattamente il caso in cui **un servizio dipende da un altro servizio** (`HttpClient`, ottenuto con `inject()`, senza alcun `new`). Svantaggi: serve un backend, e la gestione diventa **asincrona** (attese, errori, stati di caricamento, richieste ottimistiche), quindi i componenti devono gestire `loading` ed `error`.

3. **Soluzioni intermedie**: `IndexedDB` per dati più grandi o strutturati; un **service worker** con cache/offline; un **cookie** per dati minuscoli che servono anche al server; una libreria di gestione dello stato con persistenza. Non cambiano il principio: la persistenza deve stare **fuori dall'app** e il servizio resta l'unico punto che la conosce.

Il vantaggio architetturale da sottolineare: qualunque soluzione si scelga, **i componenti non cambiano**. Continuano a leggere `ordine.elenco()` e a chiamare `aggiungi`/`rimuovi`/`svuota()`; cambia solo l'interno del servizio. È esattamente il punto della domanda 12.

## 12. Il menu dell'hamburgeria deve arrivare da un server. Quali file cambi e quali restano uguali? Spiega perché questa separazione è un vantaggio.

Oggi `MENU` è una costante in `src/app/modelli/piatto.ts`. Per farla arrivare da un server il modello è:

```ts
@Service()
export class MenuService {
  private readonly http = inject(HttpClient);
  readonly piatti = signal<Piatto[]>([]);

  carica(): void {
    this.http.get<Piatto[]>('/api/menu').subscribe({
      next: dati => this.piatti.set(dati),
    });
  }
}
```

**File che cambiano:**

1. **`menu-service.ts` (nuovo o modificato)** — è qui che si introduce `HttpClient` e la chiamata al server. Il menu non è più una costante, ma un **signal** (`piatti`), perché ora cambia nel tempo: la regola «se cambia nel tempo, è un signal» vale anche per i dati che arrivano dalla rete. Va gestito anche l'errore (`error: () => ...`) e, in un'app curata, uno stato `loading`.
2. **`app.config.ts`** — bisogna aggiungere `provideHttpClient()` ai provider, perché `HttpClient` è a sua volta un servizio fornito da Angular e va registrato.
3. **`menu.ts` / `menu.html` (il componente)** — minima modifica: non legge più la costante `MENU` ma il signal del servizio (`menuService.piatti()`), e chiama `carica()` in `ngOnInit` (o usa una guardia `resolve`). Poiché ora i dati possono essere vuoti mentre arrivano, il template può aver bisogno di uno stato «caricamento...» e di un `@if` sull'array vuoto.
4. **`modelli/piatto.ts`** — probabilmente **quasi invariato**: l'interfaccia `Piatto` resta identica, perché descrive già la forma del JSON. Spesso va semplicemente **rimossa la costante `MENU`**, che era il travestimento temporaneo della risposta del server. Potrebbero aggiungersi tipi di supporto per l'inviluppo della risposta (per esempio `{ piatti: Piatto[] }`) o un `id` generato dal server.

**File che restano uguali:**

- **`ordine-service.ts`**: non sa (e non deve sapere) da dove arrivano i piatti. Riceve un oggetto `Piatto` e lo usa; `numeroPezzi`, `totale`, `piattoPiuOrdinato`, `aggiungi`, `rimuovi`, `trova`, `svuota` restano gli stessi.
- **`riepilogo.ts` / `riepilogo.html`**: mostra le righe dell'ordine, non il catalogo dei piatti disponibili. Non tocca il menu.
- **`app.ts` / `app.html`**: legge `ordine.numeroPezzi()`, un `computed` del servizio dell'ordine.
- **`app.routes.ts`**: le route e i componenti non cambiano.
- **`piatto.ts` come interfaccia**: la forma del dato è la stessa; cambia solo la sua *provenienza*.

**Perché questa separazione è un vantaggio.** Il cambiamento più invasivo che si possa immaginare — passare da dati scritti nel codice a dati che arrivano da Internet, con latenza, errori e possibili fallimenti — resta **confinato a un file (o poco più)**. I componenti non si accorgono di nulla, perché parlano sempre lo stesso linguaggio:

1. **Un solo punto di cambiamento.** Non c'è bisogno di toccare ogni pagina che mostra un piatto: se ne tocca uno.
2. **La complessità resta dove serve.** La gestione della rete (attese, errori, annullamento, retry) sta nel servizio; i componenti si occupano solo di mostrare dati.
3. **I test restano possibili.** Si può iniettare una versione **finta** di `MenuService` che restituisce piatti fissi, senza contattare davvero il server: i componenti si testano in modo deterministico e veloce. È uno dei vantaggi della dependency injection ricordati dalla dispensa: «nei test si può sostituire un servizio con una versione finta».
4. **Si può cambiare idea senza riscrivere l'app.** Domani il menu potrebbe arrivare da un file JSON statico, da un `localStorage` o da un secondo server: cambia solo il servizio, il resto dell'applicazione è indifferente.
5. **La responsabilità è chiara.** Il servizio è l'unico che conosce il *protocollo* (URL, formato, autenticazione); i componenti conoscono solo il *modello*. Questa è la separazione fra **come si ottengono i dati** e **come si mostrano**, e rende il codice leggibile e modificabile a strati.

In sintesi: la sostituzione della costante `MENU` con una chiamata HTTP è la prova pratica del motivo per cui i dati stanno in un servizio e non in un componente.
