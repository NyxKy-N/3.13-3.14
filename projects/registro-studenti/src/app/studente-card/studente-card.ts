/**
 * PASSO 7 — Il componente riutilizzabile studente-card
 * ---------------------------------------------------------------
 * TRACCIA 03.14: «Una scheda riutilizzabile che mostra uno studente, con un
 * pulsante facoltativo per rimuoverlo. Il pulsante non rimuove niente da solo:
 * avvisa il padre con un output, e sarà il padre a decidere che cosa fare.»
 *
 * Questo è il principio "dumb component": la card SA mostrare, NON sa dove
 * stanno i dati né come modificarli. Così la stessa card funziona nella Home
 * (solo lettura, senza pulsante) e nel dettaglio (con pulsante) senza una riga
 * di codice in più.
 */
import { Component, input, output } from '@angular/core';
import { Studente } from '../modelli/studente';

@Component({
  imports: [],
  selector: 'app-studente-card',
  styleUrl: './studente-card.css',
  templateUrl: './studente-card.html',
  // host: { class: 'card' } mette la classe Bootstrap 'card' sull'elemento
  // <app-studente-card> stesso: è il contenitore che disegna bordo e sfondo,
  // mentre card-body è il padding interno.
  host: { class: 'card' },
})
export class StudenteCard {
  /**
   * TRACCIA 03.14: «studente è obbligatorio; azioni è facoltativo e vale true
   * se il padre non lo passa.»
   *
   * input.required<Studente>() => il padre DEVE passare [studente]="...",
   * altrimenti la compilazione lo segnala.
   * input(true) => valore predefinito true: se il padre non scrive [azioni],
   * la card mostra il pulsante.
   */
  readonly studente = input.required<Studente>();
  readonly azioni = input(true);

  /**
   * TRACCIA 03.14: «avvisa il padre con un output, e sarà il padre a decidere
   * che cosa fare.»
   * output<Studente>() dichiara l'evento `rimosso` che trasporta lo studente.
   */
  readonly rimosso = output<Studente>();

  /** Il figlio non rimuove nulla: emette soltanto l'intenzione. */
  rimuovi(): void {
    this.rimosso.emit(this.studente());
  }
}
