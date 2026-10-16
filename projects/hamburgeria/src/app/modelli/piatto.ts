/**
 * Modello dell'hamburgeria (dispensa 03.13)
 * ---------------------------------------------------------------
 * TRACCIA 03.13: «I dati del menu stanno in un file di modello:
 * src/app/modelli/piatto.ts».
 *
 * Due interfacce, non una: RigaOrdine non è un "piatto con la quantità"
 * appiattito, ma un piatto PIÙ la sua quantità. È la differenza fra il
 * catalogo (cosa posso ordinare) e l'ordine (cosa ho ordinato e quanto).
 */
export interface Piatto {
  id: number;
  nome: string;
  prezzo: number;
}

export interface RigaOrdine {
  piatto: Piatto;
  quantita: number;
}

/**
 * TRACCIA 03.13: «Oggi il menu è una costante nel codice. In un'app vera
 * arriverà da un server, attraverso Internet. Il bello dei servizi è che questo
 * cambiamento resta chiuso dentro il servizio: i componenti continueranno a
 * leggere un signal e a chiamare metodi, senza sapere da dove arrivano i dati.»
 *
 * MENU è quindi il travestimento temporaneo di una futura risposta HTTP:
 * quando arriverà da HttpClient cambierà SOLO questo file e il metodo carica()
 * del servizio, non i componenti.
 */
export const MENU: Piatto[] = [
  { id: 1, nome: 'Hamburger classico', prezzo: 8.5 },
  { id: 2, nome: 'Cheeseburger', prezzo: 9 },
  { id: 3, nome: 'Burger vegetariano', prezzo: 9.5 },
  { id: 4, nome: 'Patatine', prezzo: 3.5 },
  { id: 5, nome: 'Bibita', prezzo: 2.5 },
];
