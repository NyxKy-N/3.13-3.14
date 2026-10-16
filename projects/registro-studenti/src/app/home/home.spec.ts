/**
 * Test del componente Home (registro-studenti)
 * ---------------------------------------------------------------
 * Il PASSO 3 chiede due pulsanti di navigazione («Vai all'elenco» e «Nuovo
 * studente»); il PASSO 7 chiede la card dello studente con la media più alta,
 * senza pulsante.
 *
 * PERCHÉ QUESTO FILE ESISTE — il dettaglio che sfugge:
 * i due collegamenti sono scritti come attributi STATICI
 * (`routerLink="/elenco"`, senza quadre). Se il componente non importa
 * RouterLink, Angular NON segnala alcun errore: `routerLink` resta un attributo
 * HTML qualsiasi, l'elemento non diventa un <a href="..."> e il click non naviga.
 * Il test controlla l'attributo `href`, che esiste SOLO se la direttiva
 * RouterLink è stata applicata davvero: è la rete di sicurezza che manca al
 * compilatore.
 *
 * RouterLink vuole un Router: provideRouter([]) lo fornisce (con [] non ci sono
 * route da attivare, al componente serve solo la direttiva).
 */
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Home } from './home';

describe('Home (registro-studenti)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create the home', () => {
    const fixture = TestBed.createComponent(Home);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('mostra il numero di studenti letto dal servizio', async () => {
    const fixture = TestBed.createComponent(Home);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;

    // I cinque studenti di partenza del servizio.
    expect(compiled.textContent).toContain('Studenti registrati: 5');
  });

  it('i due pulsanti sono veri link, non semplici attributi', async () => {
    const fixture = TestBed.createComponent(Home);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;

    const href = Array.from(compiled.querySelectorAll('a.btn')).map((a) =>
      a.getAttribute('href'),
    );

    expect(href).toEqual(['/elenco', '/inserimento']);
  });

  it('mostra la card dello studente migliore, senza pulsante', async () => {
    const fixture = TestBed.createComponent(Home);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;

    const card = compiled.querySelector('app-studente-card');
    // Marco Verdi ha la media più alta (8.2).
    expect(card?.textContent).toContain('Marco Verdi');
    // [azioni]="false" => la card non ha il pulsante di rimozione.
    expect(card?.querySelector('button')).toBeNull();
  });
});
