/**
 * Test del componente radice (registro-studenti)
 * ---------------------------------------------------------------
 * Il test generato dalla CLI cercava un titolo "Hello, registro-studenti" che
 * nella versione della traccia non esiste più: la classe App è vuota e il
 * template è solo la barra di navigazione con l'outlet. Qui il test verifica
 * ciò che la traccia chiede davvero al Passo 3: «barra blu con tre voci».
 *
 * Per creare il componente servono i provider del router: App usa
 * RouterLink/RouterLinkActive, che vogliono un Router e un ActivatedRoute.
 * provideRouter([]) li fornisce; con [] non ci sono route da attivare.
 */
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';

describe('App (registro-studenti)', () => {
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

  it('mostra il titolo Registro nella barra', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.navbar-brand')?.textContent).toContain('Registro');
  });

  it('il menu ha le tre voci: Home, Elenco, Nuovo studente', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;

    const voci = Array.from(compiled.querySelectorAll('.navbar-nav .nav-link')).map((a) =>
      (a.textContent ?? '').trim(),
    );

    expect(voci.length).toBe(3);
    expect(voci).toEqual(['Home', 'Elenco', 'Nuovo studente']);
  });

  it('le tre voci puntano alle route giuste', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;

    const href = Array.from(compiled.querySelectorAll('.navbar-nav .nav-link')).map((a) =>
      a.getAttribute('href'),
    );

    expect(href).toEqual(['/home', '/elenco', '/inserimento']);
  });

  it('il main contiene il router-outlet dove il router disegna la pagina', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('main.container router-outlet')).toBeTruthy();
  });
});
