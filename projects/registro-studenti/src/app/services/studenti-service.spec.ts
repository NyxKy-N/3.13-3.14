/**
 * Test automatici di StudentiService
 * ---------------------------------------------------------------
 * TRACCIA 03.13 (test): «Un servizio non ha interfaccia grafica, quindi si può
 * verificare con un test automatico: un piccolo programma che lo usa e
 * controlla i risultati.»
 *
 * TRACCIA 03.13: «Osserva la riga TestBed.inject(StudentiService): anche nei
 * test il servizio viene ottenuto con la dependency injection. È uno dei suoi
 * vantaggi: nei test si può sostituire un servizio con una versione finta.»
 *
 * I test coprono le regole che la traccia mette in evidenza:
 *  - l'id automatico =
 *    massimo degli id esistenti + 1 (NON "numero di studenti + 1");
 *  - successivo() è circolare (dopo l'ultimo torna il primo);
 *  - migliore() sceglie la media più alta e vale undefined su lista vuota;
 *  - i componenti non possono scrivere: `studenti` è di sola lettura.
 */
import { TestBed } from '@angular/core/testing';
import { StudentiService } from './studenti-service';

describe('StudentiService', () => {
  let service: StudentiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    // Anche qui il servizio arriva dall'iniettore, non da un new.
    service = TestBed.inject(StudentiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('parte con i cinque studenti della traccia', () => {
    expect(service.numero()).toBe(5);
    expect(service.studenti()[0].nome).toBe('Luca Bianchi');
  });

  it('aggiungi assegna l id piu grande esistente + 1', () => {
    // Scenario della traccia: si elimina lo studente 2 e poi se ne aggiunge uno.
    // Con la regola sbagliata "numero di studenti + 1" l'id sarebbe 5 (gia' usato);
    // con la regola corretta (massimo + 1) l'id e' 6.
    service.rimuovi(2);
    expect(service.numero()).toBe(4);

    const nuovo = service.aggiungi('Anna Blu', '4c', 7);
    expect(nuovo.id).toBe(6);
    // La classe viene normalizzata a maiuscolo dalla pagina di inserimento,
    // ma il servizio conserva cio' che riceve: qui verifichiamo l'id.
    expect(service.trova(6)?.nome).toBe('Anna Blu');
  });

  it('aggiungi non riusa un id gia occupato dopo piu eliminazioni', () => {
    // Si eliminano gli studenti 4 e 5: restano gli id 1, 2, 3.
    // La regola sbagliata "numero di studenti + 1" assegnerebbe 4 (libero per
    // caso, ma solo perche' 4 e' stato appena eliminato); quella corretta
    // "massimo + 1" assegna 4 e poi 5.
    service.rimuovi(5);
    service.rimuovi(4);
    const a = service.aggiungi('Primo', '4A', 6);
    const b = service.aggiungi('Secondo', '4A', 6);
    expect(a.id).toBe(4);
    expect(b.id).toBe(5);
    // Nessun id duplicato nella lista: e' la proprieta' che conta davvero.
    const ids = service.studenti().map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('trova restituisce undefined se non esiste', () => {
    expect(service.trova(99)).toBeUndefined();
  });

  it('successivo e circolare: dopo l ultimo torna il primo', () => {
    expect(service.successivo(1)?.id).toBe(2);
    expect(service.successivo(5)?.id).toBe(1);
    expect(service.successivo(99)).toBeUndefined();
  });

  it('migliore sceglie la media piu alta', () => {
    // Marco Verdi 8.2 e' la media piu alta dei cinque studenti iniziali.
    expect(service.migliore()?.nome).toBe('Marco Verdi');
    expect(service.migliore()?.mediaVoti).toBe(8.2);
  });

  it('migliore vale undefined quando il registro e vuoto', () => {
    for (const s of service.studenti()) {
      service.rimuovi(s.id);
    }
    expect(service.numero()).toBe(0);
    expect(service.migliore()).toBeUndefined();
  });

  it('aggiorna sostituisce lo studente con lo stesso id (Prova tu livello 3)', () => {
    service.aggiorna({ id: 3, nome: 'Marco Verdi', classe: '5A', mediaVoti: 9.5 });
    expect(service.numero()).toBe(5); // sostituisce, non aggiunge
    expect(service.trova(3)?.classe).toBe('5A');
    expect(service.trova(3)?.mediaVoti).toBe(9.5);
    // Nessun id duplicato.
    const ids = service.studenti().map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('aggiorna con id inesistente lascia la lista invariata', () => {
    service.aggiorna({ id: 99, nome: 'Fantasma', classe: '4A', mediaVoti: 6 });
    expect(service.numero()).toBe(5);
    expect(service.trova(99)).toBeUndefined();
  });

  it('il signal esposto ai componenti non ha set ne update (asReadonly)', () => {
    // Verifica di sola lettura: la traccia chiede che i componenti leggano
    // `studenti` senza poter modificare i dati.
    const signalEsposto = service.studenti as unknown as Record<string, unknown>;
    expect(signalEsposto['set']).toBeUndefined();
    expect(signalEsposto['update']).toBeUndefined();
  });
});
