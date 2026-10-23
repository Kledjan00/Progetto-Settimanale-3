// Lista di array
let listaSerie = [
  { id: 1, titolo: "Breaking Bad", creatore: "Vince Gilligan", anno: 2008, stato: "visto", voto: 5 },
  { id: 2, titolo: "Dark", creatore: "Baran bo Odar", anno: 2017, stato: "visto", voto: 4 },
  { id: 3, titolo: "The Office", creatore: "Greg Daniels", anno: 2005, stato: "da-vedere", voto: 0 },
  { id: 4, titolo: "Stranger Things", creatore: "Matt e Ross Duffer", anno: 2016, stato: "da-vedere", voto: 0 },
  { id: 5, titolo: "Sherlock", creatore: "Steven Moffat", anno: 2010, stato: "visto", voto: 3 },
  { id: 6, titolo: "Brooklyn Nine-Nine", creatore: "Dan Goor", anno: 2013, stato: "da-vedere", voto: 0 }
];

let filtro = "tutti";
let ricerca = "";
let idInModifica = null;

/* ELEMENTI DEL DOM */
const form = document.querySelector("#form-serie");
const inputTitolo = document.querySelector("#titolo");
const inputCreatore = document.querySelector("#creatore");
const inputAnno = document.querySelector("#anno");
const selectStato = document.querySelector("#stato");
const paragrafoErrore = document.querySelector("#errore");

const elenco = document.querySelector("#elenco");
const messaggioVuoto = document.querySelector("#vuoto");

// le 5 stelle
function creaStelle(voto) {
  let stelle = "";
  for (let i = 1; i <= 5; i++) {
    let classe = "stella";
    if (i <= voto) {
      classe = "stella piena";
    }
    stelle += `<button class="${classe}" data-azione="voto" data-voto="${i}" title="Voto ${i} su 5" aria-label="Voto ${i} su 5">★</button>`;
  }
  return stelle;
}

function creaRiga(serie) {
  // testi che cambiano in base allo stato
  let testoBadge = "Da vedere";
  let testoStato = "Segna visto";
  if (serie.stato === "visto") {
    testoBadge = "Visto";
    testoStato = "Segna da vedere";
  }

  // se questa serie e' in modifica, al posto del titolo metto un input
  let titoloHtml = `<strong class="titolo">${serie.titolo}</strong>`;
  if (idInModifica === serie.id) {
    titoloHtml = `<input type="text" class="input-modifica" value="${serie.titolo}">`;
  }

  return `
    <li class="riga ${serie.stato}" data-id="${serie.id}">
      <div class="col-info">
        ${titoloHtml}
        <span class="dettagli">${serie.creatore} — ${serie.anno}</span>
      </div>
      <div class="col-stelle">${creaStelle(serie.voto)}</div>
      <div class="col-azioni">
        <span class="badge">${testoBadge}</span>
        <button class="azione" data-azione="stato">${testoStato}</button>
        <button class="azione" data-azione="modifica">Modifica</button>
        <button class="azione elimina" data-azione="elimina">Elimina</button>
      </div>
    </li>`;
}


/* RENDER()
   Una sola funzione che ridipinge la lista. A ogni chiamata:
   parte dall'array completo, ricrea l'HTML delle righe con innerHTML e 
   mostra o nasconde il messaggio "nessuna serie" e, se sto modificando un titolo,
   attiva gli eventi del suo input */


function render() {
  // 1) parto dall'array completo
  let visibili = listaSerie;

  // 2) ricreo tutte le righe in una mossa sola
  elenco.innerHTML = visibili.map(serie => creaRiga(serie)).join("");

  // 3) se non c'e' nessuna serie mostro il messaggio gia in html
  if (visibili.length === 0) {
    messaggioVuoto.style.display = "block";
  } else {
    messaggioVuoto.style.display = "none";
  }

  // 4) se c'e' un titolo in modifica, attivo gli eventi del suo input
  attivaModifica();
}


/* FORM CON VALIDAZIONE */

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const titolo = inputTitolo.value.trim();
  const creatore = inputCreatore.value.trim();
  const testoAnno = inputAnno.value.trim();
  const stato = selectStato.value;

  // campi obbligatori
  if (titolo === "" || creatore === "" || testoAnno === "") {
    paragrafoErrore.textContent = "Compila titolo, creatore e anno.";
    return;
  }

  // controllo sull'anno
  const anno = Number(testoAnno);
  const annoMassimo = new Date().getFullYear() + 1;
  if (anno < 1950 || anno > annoMassimo || anno !== Math.floor(anno)) {
    paragrafoErrore.textContent = `L'anno deve essere un numero intero tra 1950 e ${annoMassimo}.`;
    return;
  }

  // controllo che la serie non ci sia gia
  const doppione = listaSerie.find(serie => serie.titolo.toLowerCase() === titolo.toLowerCase());
  if (doppione) {
    paragrafoErrore.textContent = "Questa serie è già nella lista.";
    return;
  }

  // tutto ok, creo l'oggetto con id univoco
  const nuova = {
    id: Date.now(),
    titolo: titolo,
    creatore: creatore,
    anno: anno,
    stato: stato,
    voto: 0
  };

  listaSerie.push(nuova);
  form.reset();
  paragrafoErrore.textContent = "";
  render();
});


/* INTERAZIONI BASE — eliminare, modificare il titolo, cambiare stato, stelle
   Un solo listener sul container (event delegation).
   Ogni bottone ha data-azione, ogni <li> ha data-id.
*/

// salva il nuovo titolo (se non e' vuoto) e chiude la modifica
function salvaModifica(id, testo) {
  const nuovoTitolo = testo.trim();
  idInModifica = null;

  if (nuovoTitolo === "") {
    render();
    return;
  }

  const trovata = listaSerie.find(serie => serie.id === id);
  trovata.titolo = nuovoTitolo;
  render();
}

// dopo render(): se c'e' un input di modifica gli collego Invio, Esc e blur
function attivaModifica() {
  const campo = elenco.querySelector(".input-modifica");
  if (!campo) {
    return;
  }

  campo.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      salvaModifica(idInModifica, campo.value);
    }
    if (event.key === "Escape") {
      idInModifica = null;
      render();
    }
  });

  // blur = clicco fuori dall'input
  campo.addEventListener("blur", () => {
    if (idInModifica !== null) {
      salvaModifica(idInModifica, campo.value);
    }
  });
}

elenco.addEventListener("click", (event) => {
  const bottone = event.target.closest("button");
  if (!bottone) {
    return;
  }

  const riga = bottone.closest("li");
  const id = Number(riga.dataset.id);
  const azione = bottone.dataset.azione;
  const trovata = listaSerie.find(serie => serie.id === id);

  if (azione === "elimina") {
    listaSerie = listaSerie.filter(serie => serie.id !== id);
    render();
  } else if (azione === "stato") {
    if (trovata.stato === "visto") {
      trovata.stato = "da-vedere";
    } else {
      trovata.stato = "visto";
    }
    render();
  } else if (azione === "modifica") {
    idInModifica = id;
    render();
    // metto il cursore dentro l'input appena creato
    elenco.querySelector(".input-modifica").focus();
  } else if (azione === "voto") {
    const voto = Number(bottone.dataset.voto);
    // se clicco sulla stella gia' scelta, tolgo il voto
    if (trovata.voto === voto) {
      trovata.voto = 0;
    } else {
      trovata.voto = voto;
    }
    render();
  }
});


/* PRIMO RENDER */
render();