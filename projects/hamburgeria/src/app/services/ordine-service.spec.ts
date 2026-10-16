/**
 * Test automatici di OrdineService (dispensa 03.13 + Prova tu 1-3)
 * ---------------------------------------------------------------
 * TRACCIA 03.13: «ng test --include src/app/services --watch=false» e
 * «TestBed.inject(OrdineService)».
 *
 * Il test di esempio della dispensa è quello "somma le quantità dello stesso
 * piatto": aggiungendo due volte MENU[0] (8.5) e una volta MENU[3] (3.5) si
 * ottengono 2 righe, 3 pezzi e 8.5*2 + 3.5 = 20.5 di totale.
 */
import { TestBed } from '@angular/core/testing';
import { MENU } from '../modelli/piatto';
import { OrdineService } from './ordine-service';

describe('OrdineService', () => {
  let service: OrdineService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrdineService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('parte con un ordine vuoto', () => {
    expect(service.elenco().length).toBe(0);
    expect(service.numeroPezzi()).toBe(0);
    expect(service.totale()).toBe(0);
  });

  it('somma le quantita dello stesso piatto', () => {
    // Test identico a quello della dispensa 03.13.
    service.aggiungi(MENU[0]);
    service.aggiungi(MENU[0]);
    service.aggiungi(MENU[3]);
    expect(service.elenco().length).toBe(2);
    expect(service.numeroPezzi()).toBe(3);
    expect(service.totale()).toBe(20.5);
  });

  it('rimuovi elimina la riga intera', () => {
    service.aggiungi(MENU[0]);
    service.aggiungi(MENU[1]);
    service.rimuovi(MENU[0].id);
    expect(service.elenco().length).toBe(1);
    expect(service.trova(MENU[0].id)).toBeUndefined();
  });

  it('svuota riparte da zero', () => {
    service.aggiungi(MENU[0]);
    service.aggiungi(MENU[1]);
    service.svuota();
    expect(service.elenco().length).toBe(0);
    expect(service.totale()).toBe(0);
  });

  it('togliUno decrementa la quantita (Prova tu 2)', () => {
    service.aggiungi(MENU[0]);
    service.aggiungi(MENU[0]);
    service.aggiungi(MENU[0]);
    expect(service.trova(MENU[0].id)?.quantita).toBe(3);

    service.togliUno(MENU[0].id);
    expect(service.trova(MENU[0].id)?.quantita).toBe(2);
    expect(service.numeroPezzi()).toBe(2);
  });

  it('togliUno rimuove la riga quando arriva a zero (Prova tu 2)', () => {
    service.aggiungi(MENU[0]);
    service.togliUno(MENU[0].id);
    // Nessuna riga fantasma con quantita 0.
    expect(service.elenco().length).toBe(0);
    expect(service.trova(MENU[0].id)).toBeUndefined();
  });

  it('togliUno su un piatto assente non cambia nulla', () => {
    service.aggiungi(MENU[0]);
    service.togliUno(99);
    expect(service.elenco().length).toBe(1);
  });

  it('piattoPiuOrdinato e la riga con la quantita maggiore (Prova tu 3)', () => {
    service.aggiungi(MENU[1]);
    service.aggiungi(MENU[1]);
    service.aggiungi(MENU[1]);
    service.aggiungi(MENU[4]);
    expect(service.piattoPiuOrdinato()?.piatto.id).toBe(MENU[1].id);
    expect(service.piattoPiuOrdinato()?.quantita).toBe(3);
  });

  it('piattoPiuOrdinato vale undefined quando l ordine e vuoto (Prova tu 3)', () => {
    expect(service.piattoPiuOrdinato()).toBeUndefined();
  });

  it('il signal esposto non ha set ne update (asReadonly)', () => {
    const signalEsposto = service.elenco as unknown as Record<string, unknown>;
    expect(signalEsposto['set']).toBeUndefined();
    expect(signalEsposto['update']).toBeUndefined();
  });
});
