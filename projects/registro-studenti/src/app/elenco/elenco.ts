/**
 * PASSO 4 + PASSO 5 — L'elenco (src/app/elenco/elenco.ts)
 * ---------------------------------------------------------------
 * TRACCIA 03.14 (Passo 4): «readonly studenti = this.studentiService.studenti;
 * rende disponibile al template il signal del servizio. Non è una copia: è lo
 * stesso signal, quindi quando il servizio cambia i dati, la tabella si
 * aggiorna.»
 *
 * TRACCIA 03.14 (Passo 4): «Elimina chiama un metodo del componente, che a sua
 * volta chiama il servizio: il componente non tocca mai i dati direttamente.»
 * Infatti qui NON esiste nessun `dati.set(...)`: si passa da rimuovi().
 */
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { StudentiService } from '../services/studenti-service';

/** PROVA TU livello 2: i due criteri di ordinamento disponibili. */
export type Ordine = 'nessuno' | 'nome' | 'media';

@Component({
  // FormsModule serve per [(ngModel)] del filtro: senza, Angular risponde
  // "NG8002: Can't bind to 'ngModel' since it isn't a known property of 'input'".
  // RouterLink serve per i link "Dettaglio" e "Modifica" (Passo 8 / Prova tu 3).
  imports: [FormsModule, RouterLink],
  selector: 'app-elenco',
  styleUrl: './elenco.css',
  templateUrl: './elenco.html',
})
export class Elenco {
  // `private` perché il template non usa il servizio direttamente: passa
  // sempre dai metodi di questa classe.
  private readonly studentiService = inject(StudentiService);

  /**
   * PASSO 4 — TRACCIA: «readonly studenti = this.studentiService.studenti;»
   * È lo STESSO signal del servizio (non una copia), esposto al template.
   */
  readonly studenti = this.studentiService.studenti;

  /**
   * PASSO 5 — TRACCIA: «Il testo del filtro è un signal collegato al campo con
   * [(ngModel)]».
   * [(ngModel)]="filtroClasse" scrive in questo signal a ogni tasto premuto.
   */
  readonly filtroClasse = signal('');

  /* ===================================================================
   * PASSO 5 — Il filtro con computed
   * ===================================================================
   * TRACCIA 03.14: «A ogni tasto premuto [(ngModel)] aggiorna il signal
   * filtroClasse; il computed filtrati, che lo legge, viene ricalcolato e la
   * tabella cambia. trim() e toUpperCase() rendono il filtro tollerante:
   * 4a e 4A trovano gli stessi studenti.»
   *
   * Nota: il campo NON sta dentro un <form>, quindi non serve l'attributo name.
   */
  readonly filtrati = computed(() => {
    const filtro = this.filtroClasse().trim().toUpperCase();
    const tutti = this.studentiService.studenti();
    if (filtro === '') {
      return tutti;
    }
    return tutti.filter((s) => s.classe.toUpperCase() === filtro);
  });

  /* ===================================================================
   * PROVA TU — LIVELLO 1 (Media della classe)
   * ===================================================================
   * TRACCIA 03.14: «In Elenco aggiungi un computed mediaClasse con la media
   * dei voti degli studenti filtrati (attenzione alla divisione per zero se la
   * lista è vuota) e mostrala sotto la tabella con due decimali (toFixed(2)).
   * Filtrando 4A deve comparire 7.30.»
   *
   * Verifica del risultato della traccia: 4A => Marco Verdi 8.2 e Giulia Neri
   * 6.4 => (8.2 + 6.4) / 2 = 14.6 / 2 = 7.3 => toFixed(2) = "7.30".
   *
   * ATTENZIONE ALLA DIVISIONE PER ZERO: se non ci sono studenti filtrati,
   * `somma / 0` darebbe NaN, che nel template comparirebbe come "NaN".
   * Qui si restituisce 0 in quel caso.
   */
  readonly mediaClasse = computed(() => {
    const lista = this.filtrati();
    if (lista.length === 0) {
      return 0;
    }
    const somma = lista.reduce((acc, s) => acc + s.mediaVoti, 0);
    return somma / lista.length;
  });

  /* ===================================================================
   * PROVA TU — LIVELLO 2 (Ordinamento)
   * ===================================================================
   * TRACCIA 03.14: «Aggiungi all'elenco due pulsanti, Per nome e Per media,
   * che impostano un signal ordine. Un computed visibili restituisce una copia
   * di filtrati() ordinata per nome (a.nome.localeCompare(b.nome)) oppure per
   * media decrescente; il @for usa visibili().»
   */
  readonly ordine = signal<Ordine>('nessuno');

  readonly visibili = computed(() => {
    // [...lista] è una COPIA: sort() ordina sul posto, e senza copia
    // modificherebbe l'array del signal del servizio. Mai mutare i dati del
    // servizio da un componente.
    const lista = [...this.filtrati()];
    switch (this.ordine()) {
      case 'nome':
        // localeCompare confronta rispettando l'ordine alfabetico della lingua.
        return lista.sort((a, b) => a.nome.localeCompare(b.nome));
      case 'media':
        // b - a => ordine DECRESCENTE (dal voto più alto al più basso).
        return lista.sort((a, b) => b.mediaVoti - a.mediaVoti);
      default:
        return lista;
    }
  });

  /** PASSO 4 — TRACCIA: «Elimina chiama un metodo del componente, che a sua
   * volta chiama il servizio: il componente non tocca mai i dati direttamente.» */
  rimuovi(id: number): void {
    this.studentiService.rimuovi(id);
  }
}
