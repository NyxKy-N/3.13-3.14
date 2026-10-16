/**
 * PASSO 6 — La pagina di inserimento (inserimento.ts)
 * ---------------------------------------------------------------
 * TRACCIA 03.14 (Passo 6), le novità:
 *  - «Dentro un <form>, ogni campo con [(ngModel)] deve avere l'attributo name:
 *    Angular lo usa per registrare il campo nel form.»
 *  - «#modulo="ngForm" crea una variabile di template che punta non all'elemento
 *    <form>, ma all'oggetto con cui Angular controlla il form. modulo.invalid è
 *    vero quando almeno un campo non rispetta le sue regole.»
 *  - «(ngSubmit) scatta sia con il pulsante type="submit" sia premendo Invio in
 *    un campo, senza ricaricare la pagina.»
 *  - «Dopo il salvataggio, router.navigate(['/elenco']) porta all'elenco da
 *    codice: non c'è un link da cliccare, la navigazione è la conseguenza di
 *    un'azione.»
 */
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { StudentiService } from '../services/studenti-service';

@Component({
  // FormsModule: senza, [(ngModel)] non è riconosciuto (errore NG8002).
  imports: [FormsModule],
  selector: 'app-inserimento',
  styleUrl: './inserimento.css',
  templateUrl: './inserimento.html',
})
export class Inserimento {
  private readonly studentiService = inject(StudentiService);
  // Router serve per navigare da codice dopo il salvataggio.
  private readonly router = inject(Router);

  // Un signal per campo: il template li collega con [(ngModel)].
  readonly nome = signal('');
  readonly classe = signal('4B'); // valore iniziale comodo per chi compila
  readonly media = signal(6);

  salva(): void {
    /**
     * TRACCIA 03.14: «Number(this.media()) garantisce che la media sia un
     * numero; la classe viene scritta in maiuscolo per coerenza con le altre.»
     *
     * Perché Number(...)? Perché un <input type="number"> consegna comunque un
     * valore che, a seconda del campo, può arrivare come stringa: il tipo
     * dichiarato in `Studente.mediaVoti` è number e va rispettato.
     * `.trim()` toglie gli spazi accidentali, `toUpperCase()` normalizza la
     * classe così "4b" e "4B" restano la stessa classe anche nel filtro.
     */
    this.studentiService.aggiungi(
      this.nome().trim(),
      this.classe().trim().toUpperCase(),
      Number(this.media()),
    );
    // Navigazione da codice: l'utente non clicca un link, è la conseguenza
    // dell'azione di salvataggio.
    this.router.navigate(['/elenco']);
  }
}
