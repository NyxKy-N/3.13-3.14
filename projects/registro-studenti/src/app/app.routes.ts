/**
 * PASSO 3 (+ Passo 8, + Prova tu livello 3) — Le route
 * ---------------------------------------------------------------
 * TRACCIA 03.14 — Domanda 1: «Che cos'è app.routes.ts e che cosa contiene in
 * questo progetto? Elenca gli URL e il componente che mostrano.»
 *
 *  URL            componente
 *  '' (redirect)  -> /home                    (pathMatch: 'full')
 *  /home          Home
 *  /elenco        Elenco
 *  /inserimento   Inserimento
 *  /elenco/:id    DettaglioStudente           (Passo 8)
 *  /modifica/:id  ModificaStudente            (Prova tu, livello 3)
 *  '**'           qualunque URL ignoto -> /home
 */
import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Elenco } from './elenco/elenco';
import { Inserimento } from './inserimento/inserimento';
import { DettaglioStudente } from './dettaglio-studente/dettaglio-studente';
import { ModificaStudente } from './modifica-studente/modifica-studente';

export const routes: Routes = [
  // pathMatch: 'full' => il redirect scatta solo per l'URL esattamente vuoto.
  // Senza 'full', qualunque URL "comincia con ''" e verrebbe rediretto sempre.
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: Home },
  { path: 'elenco', component: Elenco },
  { path: 'inserimento', component: Inserimento },
  // PASSO 8 — TRACCIA 03.14: «Aggiungi la route PRIMA della wildcard.»
  // L'ordine conta: le route si provano dall'alto in basso e '**' cattura
  // tutto. Se '**' stesse prima, /elenco/2 non arriverebbe mai al dettaglio.
  { path: 'elenco/:id', component: DettaglioStudente },
  // PROVA TU livello 3 — route di modifica, anch'essa prima della wildcard.
  { path: 'modifica/:id', component: ModificaStudente },
  { path: '**', redirectTo: 'home' },
];
