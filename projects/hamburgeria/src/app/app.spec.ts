/**
 * Test del componente radice (hamburgeria)
 * ---------------------------------------------------------------
 * TRACCIA 03.13: «Infine il componente radice mostra nella barra il numero di
 * prodotti» e «premendo Aggiungi nel menu, l'etichetta nella barra cresce
 * subito: Menu ha modificato il signal del servizio, e App legge un computed
 * che dipende da quel signal.»
 *
 * Il secondo test verifica esattamente questo: senza toccare App, si modifica
 * l'ordine tramite il servizio e il badge cambia da solo.
 *
 * Il test generato dalla CLI cercava un titolo "Hello, hamburgeria" che nella
 * versione della traccia non esiste più. Servono inoltre i provider del router,
 * perché App usa RouterLink/RouterLinkActive.
 */
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { MENU } from './modelli/piatto';
import { OrdineService } from './services/ordine-service';

describe('App (hamburgeria)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('mostra il nome Hamburgeria nella barra', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.navbar-brand')?.textContent).toContain('Hamburgeria');
  });

  it('il badge parte da zero a ordine vuoto', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.badge')?.textContent?.trim()).toBe('0');
  });

  it('il badge si aggiorna da solo quando il servizio cambia (computed)', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;

    // Si modifica l'ordine tramite il servizio, non tramite App: è lo stesso
    // servizio singleton che App legge nel suo computed numeroPezzi.
    const ordine = TestBed.inject(OrdineService);
    ordine.aggiungi(MENU[0]);
    ordine.aggiungi(MENU[0]);
    ordine.aggiungi(MENU[4]);

    await fixture.whenStable();
    expect(compiled.querySelector('.badge')?.textContent?.trim()).toBe('3');
  });
});
