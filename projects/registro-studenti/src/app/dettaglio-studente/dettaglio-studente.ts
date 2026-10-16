/**
 * PASSO 8 — Il dettaglio con il parametro nell'URL
 * ---------------------------------------------------------------
 * TRACCIA 03.14 — i tre punti chiave:
 *
 * 1) «L'id arriva dall'URL come stringa: Number(...) lo converte, altrimenti
 *    trova confronterebbe '2' con 2 e non troverebbe nessuno.»
 *    Infatti paramMap.get('id') restituisce `string | null`.
 *
 * 2) «Studente successivo porta da /elenco/2 a /elenco/3: la route è la stessa
 *    e Angular riusa il componente, senza eseguire di nuovo ngOnInit. Solo
 *    perché il parametro è letto con paramMap.subscribe la pagina si aggiorna.
 *    Con lo snapshot (this.route.snapshot.paramMap.get('id')) l'URL cambierebbe
 *    ma la scheda resterebbe ferma.»
 *
 * 3) «Se lo studente non esiste (per esempio /elenco/99), il componente rimanda
 *    all'elenco. Lo stesso succede dopo la rimozione: la card emette rimosso,
 *    il padre chiama il servizio e poi naviga.»
 */
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Studente } from '../modelli/studente';
import { StudentiService } from '../services/studenti-service';
import { StudenteCard } from '../studente-card/studente-card';

@Component({
  // StudenteCard è la SECONDA pagina che riusa la stessa scheda (la prima è la
  // Home): è esattamente ciò che chiede la traccia al Passo 7.
  imports: [RouterLink, StudenteCard],
  selector: 'app-dettaglio-studente',
  styleUrl: './dettaglio-studente.css',
  templateUrl: './dettaglio-studente.html',
})
export class DettaglioStudente implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly studentiService = inject(StudentiService);

  /**
   * TRACCIA (Errore comune): «Studente successivo cambia l'URL ma non la
   * scheda — Hai letto il parametro con lo snapshot, oppure studente non è un
   * signal. Usa paramMap.subscribe e un signal.»
   *
   * `studente` è quindi un signal (non una proprietà semplice): quando
   * `studente.set(...)` cambia il valore, il template si ridisegna.
   */
  readonly studente = signal<Studente | undefined>(undefined);

  ngOnInit(): void {
    /**
     * TRACCIA 03.14: «Solo perché il parametro è letto con paramMap.subscribe
     * la pagina si aggiorna.»
     *
     * paramMap è un Observable: emette un nuovo valore ogni volta che il
     * parametro della route cambia. Passando da /elenco/2 a /elenco/3 la route
     * è la STESSA, quindi Angular NON distrugge e ricrea il componente e
     * ngOnInit NON viene rieseguito: l'unica cosa che ci avvisa del cambio è
     * questa sottoscrizione.
     *
     * L'id arriva come STRINGA ('2'): senza Number(...) il confronto
     * `s.id === id` sarebbe 2 === '2' => false e non si troverebbe nessuno.
     */
    this.route.paramMap.subscribe((parametri) => {
      const id = Number(parametri.get('id'));
      const trovato = this.studentiService.trova(id);
      if (trovato) {
        this.studente.set(trovato);
      } else {
        // /elenco/99 (o id non numerico) => si torna all'elenco.
        this.router.navigate(['/elenco']);
      }
    });
  }

  /**
   * TRACCIA: «Studente successivo scorre gli studenti e dopo l'ultimo ricomincia
   * dal primo.» Il calcolo circolare sta nel servizio (% sul numero di studenti);
   * qui si naviga alla STESSA route con l'id nuovo, e la sottoscrizione qui
   * sopra fa il resto.
   */
  successivo(): void {
    const attuale = this.studente();
    if (!attuale) {
      return;
    }
    const prossimo = this.studentiService.successivo(attuale.id);
    if (prossimo) {
      this.router.navigate(['/elenco', prossimo.id]);
    }
  }

  /** Il padre riceve l'evento `rimosso` dalla card: chiama il servizio e naviga. */
  rimuovi(s: Studente): void {
    this.studentiService.rimuovi(s.id);
    this.router.navigate(['/elenco']);
  }
}
