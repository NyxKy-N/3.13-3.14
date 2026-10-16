/**
 * Test funzionali dell'elenco — i "risultati attesi" della traccia
 * ---------------------------------------------------------------
 * Questi test verificano ESATTAMENTE i risultati attesi scritti nella traccia
 * 03.14, così che siano dimostrabili e ripetibili senza guardare la pagina:
 *
 *  Passo 4: «una tabella a righe alterne con cinque studenti; le medie di Sara
 *  Rossi e Paolo Russo sono rosse, le altre verdi.»
 *  Passo 5: «con 4a restano Marco Verdi e Giulia Neri; con 5C compare l'avviso
 *  giallo "Nessuno studente trovato per la classe 5C"».
 *  Prova tu 1: «Filtrando 4A deve comparire 7.30.»
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Elenco } from './elenco';
import { StudentiService } from '../services/studenti-service';

/**
 * Legge il testo di una cella. `querySelectorAll` restituisce `Element`, ma con
 * la configurazione strict di TypeScript il tipo arriva come `unknown` nel
 * callback di `map`: qui si restringe in modo esplicito prima di usarlo.
 */
function testo(elemento: unknown): string {
  return elemento instanceof Element ? (elemento.textContent ?? '').trim() : '';
}

describe('Elenco', () => {
  let fixture: ComponentFixture<Elenco>;
  let componente: Elenco;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Elenco],
      // Elenco usa RouterLink per i pulsanti Dettaglio/Modifica.
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Elenco);
    componente = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(componente).toBeTruthy();
  });

  /** PASSO 4: cinque studenti, le medie sotto 6 in rosso e le altre in verde. */
  it('Passo 4 — mostra 5 righe e colora le medie con le classi Bootstrap', async () => {
    const righe = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(righe.length).toBe(5);

    const medie = Array.from(
      fixture.nativeElement.querySelectorAll('tbody tr td:nth-child(4)'),
    ) as HTMLElement[];

    // Sara Rossi (5.8) e Paolo Russo (4.9) sono rosse.
    expect(medie[1].classList.contains('text-danger')).toBe(true);
    expect(medie[4].classList.contains('text-danger')).toBe(true);

    // Luca Bianchi (7.5), Marco Verdi (8.2) e Giulia Neri (6.4) sono verdi.
    expect(medie[0].classList.contains('text-success')).toBe(true);
    expect(medie[2].classList.contains('text-success')).toBe(true);
    expect(medie[3].classList.contains('text-success')).toBe(true);
  });

  /** PASSO 5: il filtro tollerante (4a come 4A) e l'avviso per la classe vuota. */
  it('Passo 5 — il filtro 4a lascia solo Marco Verdi e Giulia Neri', async () => {
    componente.filtroClasse.set('4a');
    await fixture.whenStable();

    const nomi = Array.from(
      fixture.nativeElement.querySelectorAll('tbody tr td:nth-child(2)'),
    ).map(testo);

    expect(nomi).toEqual(['Marco Verdi', 'Giulia Neri']);
  });

  it('Passo 5 — con 5C compare l avviso giallo e sparisce la tabella', async () => {
    componente.filtroClasse.set('5C');
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('table')).toBeNull();
    const avviso = fixture.nativeElement.querySelector('.alert-warning');
    expect(avviso?.textContent).toContain('Nessuno studente trovato per la classe 5C');
  });

  it('Passo 5 — cancellando il filtro tornano tutti gli studenti', async () => {
    componente.filtroClasse.set('4a');
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelectorAll('tbody tr').length).toBe(2);

    componente.filtroClasse.set('');
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelectorAll('tbody tr').length).toBe(5);
  });

  /** PROVA TU 1: la media dei filtrati, con due decimali. */
  it('Prova tu 1 — filtrando 4A la media della classe e 7.30', async () => {
    componente.filtroClasse.set('4A');
    await fixture.whenStable();

    // (8.2 + 6.4) / 2 = 7.3
    expect(componente.mediaClasse()).toBeCloseTo(7.3);

    const testo = fixture.nativeElement.textContent as string;
    expect(testo).toContain('7.30');
  });

  it('Prova tu 1 — con lista vuota la media e 0 e non NaN', async () => {
    componente.filtroClasse.set('ZZ');
    await fixture.whenStable();

    expect(componente.mediaClasse()).toBe(0);
    // Il caso pericoloso: senza la guardia sulla divisione per zero il
    // template mostrerebbe "NaN".
    expect(fixture.nativeElement.textContent).not.toContain('NaN');
  });

  /** PROVA TU 2: l'ordinamento su una copia, senza toccare i dati del servizio. */
  it('Prova tu 2 — Per nome ordina alfabeticamente', async () => {
    componente.ordine.set('nome');
    await fixture.whenStable();

    const nomi = Array.from(
      fixture.nativeElement.querySelectorAll('tbody tr td:nth-child(2)'),
    ).map(testo);

    expect(nomi).toEqual([
      'Giulia Neri',
      'Luca Bianchi',
      'Marco Verdi',
      'Paolo Russo',
      'Sara Rossi',
    ]);
  });

  it('Prova tu 2 — Per media ordina dal voto piu alto al piu basso', async () => {
    componente.ordine.set('media');
    await fixture.whenStable();

    const medie = Array.from(
      fixture.nativeElement.querySelectorAll('tbody tr td:nth-child(4)'),
    ).map((td) => Number(testo(td)));

    expect(medie).toEqual([8.2, 7.5, 6.4, 5.8, 4.9]);
  });

  it('Prova tu 2 — ordinare non modifica l ordine dei dati nel servizio', async () => {
    const servizio = TestBed.inject(StudentiService);
    const primaDellOrdinamento = servizio.studenti().map((s) => s.id);

    componente.ordine.set('media');
    await fixture.whenStable();

    // L'array del servizio resta nell'ordine di inserimento: `visibili` ha
    // ordinato una COPIA, non l'originale.
    expect(servizio.studenti().map((s) => s.id)).toEqual(primaDellOrdinamento);
  });

  /** PASSO 4 + PASSO 8: l'eliminazione passa dal servizio. */
  it('Passo 4 — Elimina rimuove lo studente tramite il servizio', async () => {
    const servizio = TestBed.inject(StudentiService);
    expect(servizio.numero()).toBe(5);

    // Il metodo del componente delega al servizio: il componente non tocca i dati.
    componente.rimuovi(2);

    expect(servizio.numero()).toBe(4);
    expect(servizio.trova(2)).toBeUndefined();
  });
});
