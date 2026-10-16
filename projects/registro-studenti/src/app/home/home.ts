/**
 * PASSO 3 — La home
 * ---------------------------------------------------------------
 * TRACCIA 03.14: «La proprietà studentiService non è private perché il
 * template la usa.»
 *
 * `inject(StudentiService)` va scritta come inizializzazione di proprietà
 * (o nel costruttore), MAI dentro un metodo: lì Angular non è più in un
 * "injection context" e si ottiene l'errore NG0203.
 *
 * `readonly` (senza `private`) => il template può leggere
 * `studentiService.numero()`, ma nessuno può riassegnare la proprietà.
 */
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StudentiService } from '../services/studenti-service';
// PASSO 7 — TRACCIA: «Aggiungi StudenteCard agli imports di Home.»
import { StudenteCard } from '../studente-card/studente-card';

@Component({
  // RouterLink serve per i due pulsanti «Vai all'elenco» e «Nuovo studente»:
  // SENZA questo import `routerLink` resta un attributo HTML qualsiasi, il
  // collegamento non diventa un <a href="..."> e il click non naviga. Angular
  // non segnala l'errore perché l'attributo è scritto senza quadre (statico).
  imports: [StudenteCard, RouterLink],
  selector: 'app-home',
  styleUrl: './home.css',
  templateUrl: './home.html',
})
export class Home {
  readonly studentiService = inject(StudentiService);
}
