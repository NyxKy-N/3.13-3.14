/**
 * PASSO 2 — Il servizio StudentiService
 * ---------------------------------------------------------------
 * TRACCIA 03.14: «Leggi il servizio con attenzione, perché tutto il resto del
 * laboratorio lo usa.»
 *
 * Un servizio è una classe con dati e logica CONDIVISI: Angular ne crea una
 * sola istanza per tutta l'app (singleton) e la consegna a ogni componente che
 * la chiede con inject(). Il decoratore @Service() (Angular 22) è equivalente
 * alla forma classica @Injectable({ providedIn: 'root' }): dice "servizio
 * disponibile in tutta l'app, nell'iniettore radice".
 */
import { Service, computed, signal } from '@angular/core';
import { Studente } from '../modelli/studente';

@Service()
export class StudentiService {
  /**
   * TRACCIA 03.14: «dati è il signal con l'elenco ed è privato: solo il
   * servizio può modificarlo.»
   *
   * `private` => nessun componente può chiamare `dati.set(...)` o
   * `dati.update(...)`. Tutte le regole sui dati (per esempio come si calcola
   * l'id) restano in un posto solo: qui.
   */
  private readonly dati = signal<Studente[]>([
    { id: 1, nome: 'Luca Bianchi', classe: '4B', mediaVoti: 7.5 },
    { id: 2, nome: 'Sara Rossi', classe: '4B', mediaVoti: 5.8 },
    { id: 3, nome: 'Marco Verdi', classe: '4A', mediaVoti: 8.2 },
    { id: 4, nome: 'Giulia Neri', classe: '4A', mediaVoti: 6.4 },
    { id: 5, nome: 'Paolo Russo', classe: '4B', mediaVoti: 4.9 },
  ]);

  /**
   * TRACCIA 03.14: «I componenti leggono studenti, la sua versione in sola
   * lettura ottenuta con asReadonly().»
   *
   * asReadonly() restituisce un signal leggibile con `studenti()` ma SENZA
   * i metodi `set` e `update`. È l'equivalente dei campi privati con metodi
   * pubblici che conosci da Java: si legge, si modifica solo dalle porte
   * ufficiali.
   */
  readonly studenti = this.dati.asReadonly();

  /**
   * TRACCIA 03.14: «numero e migliore sono valori derivati.»
   *
   * computed() non conserva una copia: si RICALCOLA da solo quando `dati`
   * cambia. Nessuno deve ricordarsi di aggiornarlo a mano.
   */
  readonly numero = computed(() => this.dati().length);

  /**
   * TRACCIA 03.14: «reduce scorre la lista tenendo lo studente con la media
   * più alta trovato fin qui.»
   *
   * Il caso lista vuota va gestito esplicitamente: reduce() su un array vuoto
   * senza valore iniziale lancia un errore. Qui si restituisce `undefined`,
   * che è anche il tipo promesso dal computed.
   */
  readonly migliore = computed(() => {
    const lista = this.dati();
    if (lista.length === 0) {
      return undefined;
    }
    return lista.reduce((m, s) => (s.mediaVoti > m.mediaVoti ? s : m));
  });

  /**
   * I metodi sono le uniche porte per modificare i dati: sono le operazioni
   * CRUD (crea, leggi, aggiorna, cancella) che ritroverai identiche quando i
   * dati staranno su un server.
   */
  aggiungi(nome: string, classe: string, mediaVoti: number): Studente {
    const nuovo: Studente = {
      id: this.prossimoId(),
      nome: nome,
      classe: classe,
      mediaVoti: mediaVoti,
    };
    // update con un NUOVO array: non si modifica quello esistente sul posto.
    // Angular confronta il riferimento del signal per capire che è cambiato.
    this.dati.update((lista) => [...lista, nuovo]);
    return nuovo;
  }

  rimuovi(id: number): void {
    this.dati.update((lista) => lista.filter((s) => s.id !== id));
  }

  /**
   * TRACCIA 03.14: «trova restituisce lo studente oppure undefined.»
   * Il tipo di ritorno `Studente | undefined` obbliga chi chiama a gestire
   * il caso "non trovato" (nel dettaglio: si torna all'elenco).
   */
  trova(id: number): Studente | undefined {
    return this.dati().find((s) => s.id === id);
  }

  /**
   * TRACCIA 03.14: «successivo restituisce quello dopo nell'elenco e, dopo
   * l'ultimo, ricomincia dal primo grazie al resto della divisione (%).»
   *
   * (i + 1) % lista.length vale 0 quando i è l'ultimo indice: si riparte dal
   * primo elemento, in modo circolare.
   */
  successivo(id: number): Studente | undefined {
    const lista = this.dati();
    const i = lista.findIndex((s) => s.id === id);
    if (i === -1) {
      return undefined;
    }
    return lista[(i + 1) % lista.length];
  }

  /**
   * TRACCIA 03.14: «aggiungi calcola da solo l'id: il più grande tra quelli
   * esistenti, più uno. Non basta "numero di studenti + 1": dopo aver
   * eliminato lo studente 2, il sesto inserito avrebbe l'id 5, già usato.»
   *
   * Math.max(0, ...ids) tiene conto anche del caso lista vuota (Math.max() di
   * niente sarebbe -Infinity, quindi l'id diventerebbe -Infinity + 1).
   */
  private prossimoId(): number {
    return Math.max(0, ...this.dati().map((s) => s.id)) + 1;
  }

  /* ===================================================================
   * PROVA TU — LIVELLO 3 (Modifica)
   * ===================================================================
   * TRACCIA 03.14: «Aggiungi al servizio un metodo aggiorna(modificato:
   * Studente) che sostituisce lo studente con lo stesso id usando map.»
   *
   * map costruisce un NUOVO array in cui l'elemento con lo stesso id viene
   * sostituito. Di nuovo: niente modifiche sul posto, si crea una copia.
   * Se l'id non esiste, l'array resta invariato (map non aggiunge nulla).
   */
  aggiorna(modificato: Studente): void {
    this.dati.update((lista) =>
      lista.map((s) => (s.id === modificato.id ? modificato : s)),
    );
  }
}
