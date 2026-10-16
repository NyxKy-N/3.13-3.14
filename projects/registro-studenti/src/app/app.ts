/**
 * PASSO 3 — Il componente radice (src/app/app.ts)
 * ---------------------------------------------------------------
 * TRACCIA 03.14: «La barra blu con tre voci» e il contenuto delle pagine.
 *
 * La classe App è VUOTA di proposito in questo laboratorio: la cornice non ha
 * dati propri: il numero di studenti lo mostra la Home, leggendolo dal servizio.
 *
 * RouterOutlet      = il "buco" nel template dove il router disegna la pagina attiva.
 * RouterLink        = link interni (niente ricarica della pagina).
 * RouterLinkActive  = aggiunge la classe 'active' al link della pagina corrente.
 */
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {}
