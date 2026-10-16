/**
 * Menu — la pagina che aggiunge piatti all'ordine (dispensa 03.13)
 * ---------------------------------------------------------------
 * TRACCIA 03.13: «Ora i tre componenti chiedono il servizio con inject() e lo
 * usano. La pagina del menu aggiunge piatti e mostra quanti ne sono già
 * nell'ordine.»
 *
 * `private readonly ordine` => il template NON usa il servizio direttamente, ma
 * passa dai metodi di questa classe (aggiungi, quantitaDi). È lo stile del
 * laboratorio: il componente non tocca mai i dati del servizio a mano.
 */
import { Component, inject } from '@angular/core';
import { MENU, Piatto } from '../modelli/piatto';
import { OrdineService } from '../services/ordine-service';

@Component({
  imports: [],
  selector: 'app-menu',
  styleUrl: './menu.css',
  templateUrl: './menu.html',
})
export class Menu {
  private readonly ordine = inject(OrdineService);

  /**
   * TRACCIA 03.13: «Oggi il menu è una costante nel codice.» MENU è un array
   * semplice (non un signal) perché non cambia durante l'uso dell'app: il menu
   * è sempre lo stesso. Sarà un signal il giorno in cui arriverà da un server.
   */
  readonly piatti = MENU;

  /** Il componente non modifica l'array: delega al servizio. */
  aggiungi(p: Piatto): void {
    this.ordine.aggiungi(p);
  }

  /**
   * TRACCIA 03.13: «?. (optional chaining) legge quantita solo se trova ha
   * restituito una riga; altrimenti l'espressione vale undefined e ?? 0 la
   * sostituisce con zero.»
   *
   * Senza questa coppia di operatori, un piatto non ancora ordinato farebbe
   * esplodere `undefined.quantita`.
   *
   * Nota sui signal: questo metodo legge il signal `righe` del servizio, quindi
   * il badge verde "N nell'ordine" si aggiorna da solo quando l'ordine cambia,
   * in qualunque pagina si trovi il componente.
   */
  quantitaDi(p: Piatto): number {
    return this.ordine.trova(p.id)?.quantita ?? 0;
  }
}
