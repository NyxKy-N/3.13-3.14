/**
 * Il componente radice dell'hamburgeria (dispensa 03.13)
 * ---------------------------------------------------------------
 * TRACCIA 03.13: «Infine il componente radice mostra nella barra il numero di
 * prodotti.»
 *
 * Questo è il TERZO componente che usa lo stesso servizio: la pagina Menu, la
 * pagina Riepilogo e la barra qui sopra. Non sono padre e figlio tra loro (le
 * pagine non compaiono come tag nel template di App), quindi input e output non
 * basterebbero: è esattamente il problema che un servizio risolve.
 *
 * TRACCIA 03.13: «premendo Aggiungi nel menu, l'etichetta nella barra cresce
 * subito: Menu ha modificato il signal del servizio, e App legge un computed
 * che dipende da quel signal.»
 */
import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { OrdineService } from './services/ordine-service';

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  /**
   * `readonly` ma NON `private`: il template legge `ordine.numeroPezzi()`, che
   * è un computed del servizio => il badge si aggiorna da solo.
   */
  readonly ordine = inject(OrdineService);
}
