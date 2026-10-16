/**
 * PASSO 1 — Il modello Studente
 * ---------------------------------------------------------------
 * TRACCIA 03.14: «src/app/modelli/studente.ts — Un'interfaccia basta: uno
 * studente è un insieme di dati senza comportamento, come quelli che un giorno
 * arriveranno da un server.»
 *
 * Perché una `interface` e non una `class`? Un modello descrive solo la FORMA
 * del dato: non ha logica da eseguire, quindi non serve alcuna istanza.
 * Quando i dati arriveranno da un server (HttpClient) saranno esattamente
 * JSON con questa forma: l'interfaccia resta valida senza cambiare una riga.
 */
export interface Studente {
  id: number;
  nome: string;
  classe: string;
  mediaVoti: number;
}
