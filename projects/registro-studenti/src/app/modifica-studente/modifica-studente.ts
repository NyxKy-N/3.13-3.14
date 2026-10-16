/**
 * PROVA TU — LIVELLO 3 (Modifica)
 * ---------------------------------------------------------------
 * TRACCIA 03.14: «Crea il componente modifica-studente con la route
 * modifica/:id: in ngOnInit legge l'id, trova lo studente e ne copia i dati nei
 * signal del form (lo stesso form dell'inserimento); Salva chiama aggiorna e
 * naviga al dettaglio. Aggiungi nell'elenco il link Modifica con
 * [routerLink]="['/modifica', s.id]". Qui lo snapshot va bene: perché?»
 *
 * RISPOSTA (sviluppata anche in RISPOSTE.md): lo snapshot va bene perché questa
 * pagina NON ha un pulsante che cambia l'id restando sulla stessa route. Si
 * arriva da un link dell'elenco, quindi Angular distrugge il componente
 * precedente e ne crea uno nuovo: ngOnInit viene rieseguito e lo snapshot è
 * letto al momento giusto. Nel dettaglio invece "Studente successivo" naviga da
 * /elenco/2 a /elenco/3 restando sulla stessa route: lì il componente viene
 * RIUSATO, ngOnInit non viene rieseguito e serve paramMap.subscribe.
 */
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { StudentiService } from '../services/studenti-service';

@Component({
  imports: [FormsModule],
  selector: 'app-modifica-studente',
  styleUrl: './modifica-studente.css',
  templateUrl: './modifica-studente.html',
})
export class ModificaStudente implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly studentiService = inject(StudentiService);

  /**
   * L'id dello studente che stiamo modificando. Serve al momento del salvataggio
   * per costruire l'oggetto completo da passare ad aggiorna(), che sostituisce
   * per id.
   */
  private id = 0;

  /**
   * Gli stessi signal del form di inserimento: la traccia chiede di riusare
   * "lo stesso form dell'inserimento". Non si scrive direttamente sull'oggetto
   * del servizio: si lavora su una copia di comodo e si salva solo alla fine.
   */
  readonly nome = signal('');
  readonly classe = signal('');
  readonly media = signal(6);

  /** Lo studente non trovato => si torna subito all'elenco. */
  private trovato = false;

  ngOnInit(): void {
    /**
     * Qui lo SNAPSHOT è sufficiente (vedi commento in testa al file): si arriva
     * da un link, quindi il componente è appena stato creato e questo metodo
     * viene eseguito una volta sola, con l'URL già definitivo.
     *
     * L'id arriva come stringa => Number(...) (stesso motivo del dettaglio).
     */
    const id = Number(this.route.snapshot.paramMap.get('id'));
    const studente = this.studentiService.trova(id);

    if (!studente) {
      // /modifica/99 non esiste: meglio tornare all'elenco che mostrare un
      // form vuoto che salverebbe dati sbagliati.
      this.router.navigate(['/elenco']);
      return;
    }

    this.trovato = true;
    this.id = studente.id;

    // COPIA dei dati nei signal del form: il form parte già compilato con i
    // valori attuali dello studente.
    this.nome.set(studente.nome);
    this.classe.set(studente.classe);
    this.media.set(studente.mediaVoti);
  }

  /**
   * Lo stesso trattamento dei dati dell'inserimento: trim(), toUpperCase() e
   * Number() per rispettare i tipi di Studente.
   *
   * `aggiorna` sostituisce lo studente con lo stesso id usando map (niente
   * modifiche sul posto).
   */
  salva(): void {
    if (!this.trovato) {
      return;
    }
    this.studentiService.aggiorna({
      id: this.id,
      nome: this.nome().trim(),
      classe: this.classe().trim().toUpperCase(),
      mediaVoti: Number(this.media()),
    });
    // TRACCIA: «Salva chiama aggiorna e naviga al dettaglio.»
    this.router.navigate(['/elenco', this.id]);
  }

  /** Annulla senza salvare: si torna al dettaglio dello studente. */
  annulla(): void {
    if (this.trovato) {
      this.router.navigate(['/elenco', this.id]);
    } else {
      this.router.navigate(['/elenco']);
    }
  }
}
