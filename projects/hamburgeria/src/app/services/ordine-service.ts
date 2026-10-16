/**
 * OrdineService — il cuore della dispensa 03.13
 * ---------------------------------------------------------------
 * TRACCIA 03.13: «Un servizio è una normale classe TypeScript che contiene dati
 * e logica da condividere: lo stato di un carrello, l'utente collegato, le
 * chiamate a un server. Angular ne crea una sola istanza per tutta
 * l'applicazione (si dice che è un singleton) e la consegna a ogni componente
 * che la chiede.»
 *
 * TRACCIA 03.13: «Il decoratore @Service() è la forma introdotta con Angular 22:
 * dice "questa classe è un servizio, disponibile in tutta l'app". Nella
 * documentazione e nei progetti scritti prima troverai quasi sempre la forma
 * classica, che funziona ancora ed è equivalente:
 * @Injectable({ providedIn: 'root' })».
 *
 * perché `@Service()` e non il costruttore? TRACCIA 03.13: «Non funziona invece
 * dentro una classe @Service(): la compilazione si ferma con NG2028: @Service
 * class cannot use constructor dependency injection. Per questo nei nostri
 * progetti usiamo sempre inject(), che funziona ovunque.»
 */
import { Service, computed, signal } from '@angular/core';
import { Piatto, RigaOrdine } from '../modelli/piatto';

@Service()
export class OrdineService {
  /* ===================================================================
   * PROVA TU — 1) Il servizio è davvero un singleton?
   * ===================================================================
   * TRACCIA 03.13: «Aggiungi a OrdineService un costruttore senza parametri che
   * esegue console.log('OrdineService creato'). Naviga più volte tra le due
   * pagine e aggiungi piatti: quante volte compare il messaggio? Che cosa
   * dimostra?»
   *
   * RISPOSTA: compare UNA SOLA VOLTA, all'avvio dell'app (in console, prima di
   * qualunque navigazione). Navigare avanti e indietro distrugge e ricrea i
   * COMPONENTI, ma il servizio vive nell'iniettore radice: non viene mai
   * ricreato finché l'app è aperta. È la prova pratica del singleton.
   * Ricaricando la pagina con F5, invece, l'app riparte da zero e il messaggio
   * ricompare.
   *
   * Nota: questo costruttore è SENZA parametri, quindi non viola la regola
   * NG2028 (il divieto riguarda l'iniezione di dipendenze VIA costruttore).
   */
  constructor() {
    console.log('OrdineService creato');
  }

  /**
   * TRACCIA 03.13: «Lo stato è un signal. L'ordine cambia nel tempo e i
   * componenti che lo mostrano devono aggiornarsi da soli: la regola "se cambia
   * nel tempo, è un signal" vale anche nei servizi.»
   *
   * TRACCIA 03.13: «Il signal scrivibile è privato. righe è private: nessun
   * componente può chiamare righe.set(...). All'esterno è visibile solo elenco,
   * ottenuto con asReadonly(): un signal che si può leggere (elenco()) ma che
   * non ha set né update. Chi vuole cambiare l'ordine deve passare dai metodi
   * del servizio, e così le regole (per esempio "lo stesso piatto aggiunto due
   * volte aumenta la quantità") stanno in un posto solo. È lo stesso principio
   * dei campi privati con metodi pubblici che conosci da Java.»
   */
  private readonly righe = signal<RigaOrdine[]>([]);

  /** Ciò che i componenti possono leggere: sola lettura, niente set/update. */
  readonly elenco = this.righe.asReadonly();

  /**
   * TRACCIA 03.13: «I valori derivati sono computed. numeroPezzi e totale si
   * ricalcolano da soli quando cambia righe.»
   *
   * numeroPezzi somma le QUANTITÀ (due hamburger contano 2), non le righe:
   * è il numero che appare nel badge della barra di navigazione.
   */
  readonly numeroPezzi = computed(() =>
    this.righe().reduce((somma, r) => somma + r.quantita, 0),
  );

  /** totale = somma di prezzo × quantità per ogni riga. */
  readonly totale = computed(() =>
    this.righe().reduce((somma, r) => somma + r.piatto.prezzo * r.quantita, 0),
  );

  /**
   * PROVA TU — 3) computed piattoPiuOrdinato
   * ---------------------------------------------------------------
   * TRACCIA 03.13: «Aggiungi al servizio un computed piattoPiuOrdinato (la riga
   * con la quantità maggiore, oppure undefined) e mostralo nel riepilogo con
   * @if (...; as r).»
   *
   * Come per `migliore` nel laboratorio, reduce() su un array vuoto senza
   * valore iniziale lancerebbe: la guardia length === 0 restituisce undefined,
   * che è proprio il tipo promesso.
   */
  readonly piattoPiuOrdinato = computed(() => {
    const lista = this.righe();
    if (lista.length === 0) {
      return undefined;
    }
    return lista.reduce((max, r) => (r.quantita > max.quantita ? r : max));
  });

  /**
   * TRACCIA 03.13: «I metodi seguono le operazioni sui dati: aggiungi crea o
   * aggiorna una riga (con map e una copia dell'oggetto, senza modificarlo sul
   * posto), rimuovi filtra, trova cerca per id, svuota riparte da zero. Sono le
   * operazioni CRUD (crea, leggi, aggiorna, cancella) che ritroverai identiche
   * quando i dati staranno su un server.»
   *
   * La REGOLA dell'hamburgeria: se il piatto è già nell'ordine non si crea una
   * seconda riga, si AUMENTA la quantità di quella esistente. Questa regola
   * vive qui, in un posto solo: nessun componente può aggirarla.
   */
  aggiungi(piatto: Piatto): void {
    if (this.trova(piatto.id)) {
      // map crea un NUOVO array; { ...r, quantita: r.quantita + 1 } crea un
      // NUOVO oggetto riga. Non si modifica nulla sul posto: Angular si accorge
      // del cambiamento dal nuovo riferimento del signal.
      this.righe.update((lista) =>
        lista.map((r) => (r.piatto.id === piatto.id ? { ...r, quantita: r.quantita + 1 } : r)),
      );
    } else {
      this.righe.update((lista) => [...lista, { piatto: piatto, quantita: 1 }]);
    }
  }

  /**
   * PROVA TU — 2) togliUno
   * ---------------------------------------------------------------
   * TRACCIA 03.13: «Aggiungi al servizio un metodo togliUno(idPiatto: number)
   * che diminuisce di 1 la quantità e, se arriva a zero, rimuove la riga. Nella
   * tabella del riepilogo aggiungi un pulsante -1 che lo chiama.»
   *
   * Perché non basta `quantita - 1`? Perché resterebbe una riga con quantità 0:
   * una riga fantasma che appare nella tabella e non conta nel badge. La traccia
   * chiede quindi due casi distinti, e il confronto `<= 1` copre entrambi:
   *  - quantità 1 => si elimina la riga (filter);
   *  - quantità > 1 => si decrementa (map con copia).
   */
  togliUno(idPiatto: number): void {
    this.righe.update((lista) =>
      lista
        .map((r) => (r.piatto.id === idPiatto ? { ...r, quantita: r.quantita - 1 } : r))
        .filter((r) => r.quantita > 0),
    );
  }

  /** filtra l'array: resta tutto tranne la riga di quel piatto. */
  rimuovi(idPiatto: number): void {
    this.righe.update((lista) => lista.filter((r) => r.piatto.id !== idPiatto));
  }

  /** cerca per id: restituisce la riga oppure undefined. */
  trova(idPiatto: number): RigaOrdine | undefined {
    return this.righe().find((r) => r.piatto.id === idPiatto);
  }

  /** riparte da zero: qui set() è lecito, siamo dentro il servizio. */
  svuota(): void {
    this.righe.set([]);
  }
}
