# Domande di verifica (pag. 11) — risposte

Dispensa *Modulo 03 · Angular — I servizi e la dependency injection*.

---

**1. Perché il messaggio "Hai scelto" del laboratorio 03.12 spariva cambiando pagina? Dove avresti dovuto conservarlo?**
Perché cambiando rotta il **router distrugge il componente** che si lascia e ne crea uno **nuovo** quando si torna: tutto ciò che stava nelle sue proprietà e nei suoi signal viene perso. Andava conservato **fuori dal componente**, cioè in un **servizio** (`@Service()` / `providedIn: 'root'`): un singleton che vive finché vive l'app e che sopravvive alla distruzione delle pagine. Se deve sopravvivere anche al ricaricamento (F5) servirebbe `localStorage` o un server.

**2. Che cos'è un servizio? Fai due esempi di dati che conviene tenere in un servizio invece che in un componente.**
È una **normale classe TypeScript** che contiene **dati e logica condivisi**; Angular ne crea **una sola istanza** (singleton) per tutta l'applicazione e la consegna a chi la chiede tramite la dependency injection.
Esempi: (a) il **carrello/ordine** di un e-commerce, che menu, riepilogo e barra di navigazione devono vedere uguale; (b) l'**utente collegato** (utente, token, permessi) usato da tutte le pagine; (c) la **cache dei dati scaricati dal server** (es. il menu), per non rifare la stessa richiesta HTTP.

**3. Che file crea `ng g s services/carrello-service` e come si chiama la classe? Perché aggiungiamo il suffisso `-service`?**
Crea `src/app/services/carrello-service.ts` e il file di test `src/app/services/carrello-service.spec.ts`; la classe si chiama **`CarrelloService`**. Il suffisso evita di chiamarla `Carrello`, nome che sarebbe identico a un **modello** o a un **componente** dello stesso dominio, e rende subito evidente che quella classe è un servizio.

**4. Che relazione c'è tra `@Service()` e `@Injectable({ providedIn: 'root' })`? Che errore ottieni se usi `@Injectable()` senza `providedIn`?**
Sono **equivalenti**: entrambi dicono "questa classe è un servizio registrato nell'**iniettore radice**", quindi un'unica istanza condivisa in tutta l'app. `@Service()` è la forma introdotta con Angular 22; `@Injectable({ providedIn: 'root' })` è la forma classica, che funziona ancora.
Senza `providedIn` il servizio **non è registrato**: chi prova a iniettarlo riceve l'errore **`NG0201: No provider found for`** seguito dal nome della classe, a meno che qualcuno non lo elenchi a mano nell'array `providers` di un componente o della configurazione.

**5. Che cosa significa "singleton"? Come verificheresti che un servizio viene creato una sola volta?**
Significa che dell'iniettore radice esiste **una sola istanza** di quel servizio: viene creata alla **prima richiesta** e poi tutte le richieste successive (da qualunque componente o pagina) ricevono **la stessa**. Non viene distrutta finché l'app è aperta.
Verifica pratica (PROVA TU 1): metti `console.log('OrdineService creato')` in un **costruttore senza parametri**, naviga avanti e indietro tra le pagine e aggiungi piatti → il messaggio in console compare **una volta sola**. In alternativa, in un test: `expect(TestBed.inject(OrdineService)).toBe(TestBed.inject(OrdineService))`.

**6. Spiega con parole tue la dependency injection, usando un'analogia diversa da quella della presa elettrica.**
Al ristorante: io (componente) **non entro in cucina e non assumo un pizzaiolo**, dico al cameriere "vorrei una pizza" e la pizza arriva. Il cameriere è l'**iniettore**: sa chi produce ciò che chiedo e me lo porta; la cucina è **una sola** e serve tutti i tavoli (singleton). Se domani cambia il forno, io non me ne accorgo: continuo a ordinare allo stesso modo. Allo stesso modo il componente dichiara *di che cosa ha bisogno* (`inject(OrdineService)`) e non *come costruirlo*.

**7. Perché non si scrive `new OrdineService()` in un componente? Che cosa succederebbe ai dati?**
Perché `new` crea **una copia nuova e separata** per ogni componente: ogni pagina avrebbe il **suo** ordine, l'etichetta nella barra non vedrebbe quello che aggiunge il menu e i dati non sarebbero più condivisi. In più, se il servizio dipende a sua volta da altri servizi (per esempio `HttpClient`), con `new` dovresti procurarteli tu a mano, in ogni punto; con la DI lo fa Angular.

**8. Scrivi le due forme per ottenere `OrdineService` in un componente. Quale delle due non funziona dentro una classe `@Service()`?**
```ts
// 1) con inject() — funziona ovunque
private readonly ordine = inject(OrdineService);

// 2) con il costruttore — equivalente, funziona nei componenti e con @Injectable()
constructor(readonly ordine: OrdineService) {}
```
La **forma con il costruttore non funziona dentro una classe `@Service()`**: la compilazione si ferma con **`NG2028: @Service class cannot use constructor dependency injection`**. Per questo si usa sempre `inject()`. In entrambi i casi `inject()` va chiamato solo durante la creazione dell'oggetto (proprietà o costruttore): dentro un metodo si ha **`NG0203`**.

**9. A che cosa serve `asReadonly()`? Che cosa impedisce, e perché è utile?**
Serve a esporre all'esterno una **vista di sola lettura** di un signal: si può **leggere** (`ordine.elenco()`) ma **non** esistono `set()` né `update()`. Impedisce ai componenti di modificare lo stato direttamente, quindi le regole (es. "lo stesso piatto aggiunto due volte aumenta la quantità") restano **in un posto solo**, nei metodi del servizio. È l'incapsulamento dei campi privati con metodi pubblici: se una regola cambia, si cambia una volta sola.

**10. Scrivi un metodo `aggiorna(id: number, nuovoPrezzo: number)` per un servizio che tiene un signal privato `piatti` di tipo `Piatto[]`, senza modificare l'array sul posto.**
```ts
private readonly piatti = signal<Piatto[]>([]);
readonly elenco = this.piatti.asReadonly();

aggiorna(id: number, nuovoPrezzo: number): void {
  this.piatti.update(lista =>
    lista.map(p => (p.id === id ? { ...p, prezzo: nuovoPrezzo } : p))
  );
}
```
`map` crea un **nuovo array** e `{ ...p, prezzo: nuovoPrezzo }` una **copia** del piatto: nessun oggetto esistente viene modificato "sul posto", così il signal si accorge del cambiamento e i componenti si aggiornano.

**11. Ricaricando la pagina l'ordine si svuota. Perché? Quali soluzioni proporresti?**
Perché il servizio vive **in memoria** nel processo della pagina: ricaricare significa far **ripartire l'app da zero**, l'iniettore viene ricreato e il signal riparte da `[]`. Soluzioni: (a) salvare l'ordine in **`localStorage`/`sessionStorage`** (scrittura con un `effect` che osserva il signal, lettura all'avvio del servizio); (b) persistere i dati su un **server/database** e ricaricarli all'avvio (la soluzione vera per un'app reale); (c) per dati non importanti, accontentarsi del comportamento attuale.

**12. Il menu della hamburgeria deve arrivare da un server. Quali file cambi e quali restano uguali? Spiega perché questa separazione è un vantaggio.**
**Cambiano**: il servizio (nasce un `MenuService` con `private readonly http = inject(HttpClient)` e un metodo `carica()` che fa la GET e mette i dati nel signal) e la **configurazione** (`provideHttpClient()` in `app.config.ts`).
**Restano uguali**: i modelli, gli altri servizi, i **componenti e i template**: continuano a leggere un signal e a chiamare metodi.
È un vantaggio perché **da dove arrivano i dati è un dettaglio interno al servizio**: si cambia una classe sola e nessun componente se ne accorge (separazione delle responsabilità). Inoltre i componenti diventano più facili da testare, perché nei test si può iniettare un servizio **finto** che non contatta davvero il server.
