/**
 * Riepilogo — la pagina "Il tuo ordine" (dispensa 03.13)
 * ---------------------------------------------------------------
 * TRACCIA 03.13: «La pagina dell'ordine usa il servizio direttamente nel
 * template: per questo la proprietà è readonly ma non private.»
 *
 * Ecco la differenza rispetto a Menu: qui il template scrive
 * `ordine.elenco()`, `ordine.totale()`, `ordine.svuota()` e `ordine.rimuovi()`
 * direttamente, quindi `ordine` NON può essere private.
 *
 * Anche `numeroPezzi` della barra di navigazione è letto dall'App: tre
 * componenti (Menu, Riepilogo, App) condividono lo stesso ordine perché
 * chiedono tutti lo stesso servizio all'iniettore.
 */
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OrdineService } from '../services/ordine-service';

@Component({
  // RouterLink serve per il link "scegli dal menu" mostrato quando l'ordine è
  // vuoto: senza, Angular segnala che il binding non è una proprietà nota.
  imports: [RouterLink],
  selector: 'app-riepilogo',
  styleUrl: './riepilogo.css',
  templateUrl: './riepilogo.html',
})
export class Riepilogo {
  readonly ordine = inject(OrdineService);
}
