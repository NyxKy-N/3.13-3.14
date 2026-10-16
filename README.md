# Domande 

---

**1. Perché il messaggio "Hai scelto" spariva cambiando pagina? Dove conservarlo?**

Perché il router distrugge il componente e ne crea uno nuovo. I dati vanno conservati in un **servizio** (`@Service()`), condiviso tra le pagine. Per mantenerli dopo F5 serve `localStorage` o un server.

**2. Che cos'è un servizio? Fai due esempi di dati da conservare in un servizio.**

È una **classe TypeScript** che contiene dati e logica condivisi, gestita da Angular tramite dependency injection.

Esempi: **carrello degli acquisti** e **utente collegato**.

**3. Che file crea `ng g s services/carrello-service` e come si chiama la classe? Perché usare il suffisso `-service`?**

Crea `carrello-service.ts` e `carrello-service.spec.ts`. La classe si chiama `CarrelloService`. Il suffisso distingue il servizio da componenti e modelli.

**4. Che relazione c'è tra `@Service()` e `@Injectable({ providedIn: 'root' })`? Che errore ottieni senza `providedIn`?**

Entrambi registrano il servizio nell'iniettore radice, condividendolo nell'app. Senza registrazione si ottiene `NG0201: No provider found for`, salvo registrazione manuale nei `providers`.

**5. Che cosa significa "singleton"? Come verificheresti che un servizio viene creato una sola volta?**

Significa che esiste **una sola istanza condivisa** del servizio. Inserendo `console.log()` nel costruttore e navigando tra le pagine, il messaggio compare una volta sola.

**6. Spiega la dependency injection con un'analogia diversa dalla presa elettrica.**

Al ristorante ordino una pizza al cameriere senza prepararla personalmente. Analogamente, il componente richiede un servizio tramite `inject()` e Angular glielo fornisce.

**7. Perché non si scrive `new OrdineService()` in un componente? Che cosa succederebbe ai dati?**

Perché `new` crea istanze separate: ogni componente avrebbe il proprio ordine e i dati non sarebbero condivisi. Angular, inoltre, non gestirebbe automaticamente le dipendenze.

**8. Scrivi le due forme per ottenere `OrdineService`. Quale non funziona dentro una classe `@Service()`?**

```ts
// Con inject()
private readonly ordine = inject(OrdineService);

// Con il costruttore
constructor(readonly ordine: OrdineService) {}
```

Nelle classi `@Service()` si usa `inject()`, perché la dependency injection tramite costruttore non è supportata. `inject()` va chiamato durante la creazione dell'oggetto, non dentro un metodo.

**9. A che cosa serve `asReadonly()`? Che cosa impedisce e perché è utile?**

Espone un signal in sola lettura: permette di leggere i dati, ma non di modificarli con `set()` o `update()`. Le modifiche restano nei metodi del servizio, centralizzando le regole.

**10. Scrivi un metodo `aggiorna(id: number, nuovoPrezzo: number)` senza modificare l'array sul posto.**

```ts
private readonly piatti = signal<Piatto[]>([]);
readonly elenco = this.piatti.asReadonly();

aggiorna(id: number, nuovoPrezzo: number): void {
  this.piatti.update(lista =>
    lista.map(p =>
      p.id === id ? { ...p, prezzo: nuovoPrezzo } : p
    )
  );
}
```

`map()` crea un nuovo array e `{ ...p }` una copia del piatto modificato.

**11. Ricaricando la pagina l'ordine si svuota. Perché? Quali soluzioni proporresti?**

Perché il servizio è in memoria e F5 riavvia l'applicazione. Soluzioni: salvare i dati in `localStorage`/`sessionStorage` oppure in un server/database.

**12. Il menu deve arrivare da un server. Quali file cambi e quali restano uguali? Perché?**

- **Cambiano:** il servizio, che usa `HttpClient` per scaricare i dati, e `app.config.ts`, dove si aggiunge `provideHttpClient()`.
- **Restano uguali:** modelli, altri servizi, componenti e template.

Il vantaggio è che **solo il servizio gestisce la provenienza dei dati**, senza modificare i componenti.
