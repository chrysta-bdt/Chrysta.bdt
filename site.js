/* Affichage des pages à partir de config.js — normalement pas besoin de modifier ce fichier. */

function prixTexte(f) {
    return f.prix ? f.prix : "Sur devis";
}

function echapper(texte) {
    const div = document.createElement("div");
    div.textContent = texte;
    return div.innerHTML;
}

function trouverFormule(id) {
    return FORMULES.find((f) => f.id === id);
}

/* ---------- Commun à toutes les pages ---------- */
function initCommun() {
    document.querySelectorAll("[data-site-nom]").forEach((el) => (el.textContent = SITE.nom));

    const liens = [];
    if (SITE.instagram) liens.push(`<a href="${SITE.instagram}" target="_blank" rel="noopener">Instagram</a>`);
    if (SITE.whatsapp) liens.push(`<a href="https://wa.me/${SITE.whatsapp}" target="_blank" rel="noopener">WhatsApp</a>`);
    if (SITE.email) liens.push(`<a href="mailto:${SITE.email}">${echapper(SITE.email)}</a>`);
    const footer = document.getElementById("footer-links");
    if (footer) footer.innerHTML = liens.join(" · ");
}

/* ---------- Page d'accueil ---------- */
function afficherFormules() {
    initCommun();
    const grille = document.getElementById("formules-grid");
    grille.innerHTML = FORMULES.map(
        (f) => `
        <a href="formule.html?f=${f.id}" class="card formule-card${f.populaire ? " populaire" : ""}">
            ${f.populaire ? '<span class="badge">La plus choisie</span>' : ""}
            <p class="formule-label">Collection</p>
            <h3>${echapper(f.nom)}</h3>
            <p class="formule-prix">${echapper(prixTexte(f))}</p>
            <p class="formule-reels"><strong>${f.reels}</strong> réels livrés le jour J</p>
            <p class="formule-accroche">${echapper(f.accroche)}</p>
            <span class="btn btn-outline">Voir ce que je reçois</span>
        </a>`
    ).join("");
}

/* ---------- Page d'une formule ---------- */
function afficherFormule() {
    initCommun();
    const id = new URLSearchParams(location.search).get("f");
    const f = trouverFormule(id) || FORMULES[0];

    document.title = `Formule ${f.nom} — ${SITE.nom}`;
    document.getElementById("f-nom").textContent = f.nom;
    document.getElementById("f-prix").textContent = prixTexte(f);
    document.getElementById("f-accroche").textContent = f.accroche;
    document.getElementById("f-titre-reels").innerHTML = `Vous recevez ${f.reels} réels le&nbsp;jour&nbsp;J`;

    const reels = [];
    for (let i = 0; i < f.reels; i++) {
        const src = f.videos[i];
        reels.push(
            src
                ? `<div class="reel"><video src="${src}" controls playsinline preload="metadata"></video></div>`
                : `<div class="reel reel-vide"><span class="play">&#9654;</span><span>Réel ${i + 1}</span><small>à venir</small></div>`
        );
    }
    document.getElementById("f-reels").innerHTML = reels.join("");

    document.getElementById("f-inclus").innerHTML = f.inclus.map((x) => `<li>${echapper(x)}</li>`).join("");
    document.getElementById("f-cta").href = `contact.html?f=${f.id}`;
}

/* ---------- Page contact ---------- */
function afficherContact() {
    initCommun();
    const id = new URLSearchParams(location.search).get("f");
    const select = document.getElementById("c-formule");
    select.innerHTML =
        FORMULES.map((f) => `<option value="${f.id}"${f.id === id ? " selected" : ""}>${echapper(f.nom)} — ${echapper(prixTexte(f))}</option>`).join("") +
        `<option value="autre">Je ne sais pas encore</option>`;

    const form = document.getElementById("contact-form");
    const actions = document.getElementById("c-actions");
    const note = document.getElementById("c-note");

    const boutons = [];
    if (SITE.whatsapp) boutons.push('<button type="submit" class="btn btn-gold" data-via="whatsapp">Envoyer par WhatsApp</button>');
    if (SITE.email) boutons.push('<button type="submit" class="btn btn-outline" data-via="email">Envoyer par e-mail</button>');
    if (boutons.length === 0) {
        boutons.push('<button type="submit" class="btn btn-gold" disabled>Envoyer</button>');
        note.textContent = "Coordonnées bientôt disponibles.";
    }
    actions.innerHTML = boutons.join("");

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const via = e.submitter && e.submitter.dataset.via;
        const d = new FormData(form);
        const formule = trouverFormule(d.get("formule"));
        const texte = [
            `Bonjour, je suis intéressé(e) par la formule ${formule ? formule.nom : "(à définir)"}.`,
            `Je souhaite : ${d.get("demande")}.`,
            `Nom : ${d.get("nom")}`,
            d.get("tel") ? `Téléphone : ${d.get("tel")}` : "",
            d.get("date") ? `Date de l'événement : ${d.get("date")}` : "",
            d.get("message") ? `\n${d.get("message")}` : "",
        ].filter(Boolean).join("\n");

        if (via === "whatsapp") {
            window.open(`https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(texte)}`, "_blank");
        } else if (via === "email") {
            location.href = `mailto:${SITE.email}?subject=${encodeURIComponent("Demande — " + d.get("demande"))}&body=${encodeURIComponent(texte)}`;
        }
    });
}
