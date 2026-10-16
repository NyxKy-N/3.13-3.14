/**
 * Le route dell'hamburgeria (dispensa 03.13)
 * ---------------------------------------------------------------
 * TRACCIA 03.13: «Le route sono quelle che conosci: menu → Menu, riepilogo →
 * Riepilogo, con il redirect da '' a menu e la wildcard.»
 */
import { Routes } from '@angular/router';
import { Menu } from './menu/menu';
import { Riepilogo } from './riepilogo/riepilogo';

export const routes: Routes = [
  // pathMatch: 'full' => il redirect scatta solo per l'URL esattamente vuoto.
  { path: '', redirectTo: 'menu', pathMatch: 'full' },
  { path: 'menu', component: Menu },
  { path: 'riepilogo', component: Riepilogo },
  // Qualunque URL sbagliato riporta al menu.
  { path: '**', redirectTo: 'menu' },
];
