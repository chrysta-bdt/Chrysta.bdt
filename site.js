/* Affichage des pages à partir de config.js — normalement pas besoin de modifier ce fichier. */

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
    document.querySelectorAll("[data-site-metier]").forEach((el) => (el.textContent = SITE.metier));
    document.querySelectorAll("[data-rdv]").forEach((el) => {
        if (SITE.rdv) el.href = SITE.rdv;
        else el.remove();
    });

    const liens = [];
    if (SITE.instagram) liens.push(`<a href="${SITE.instagram}" target="_blank" rel="noopener">Instagram</a>`);
    if (SITE.whatsapp) liens.push(`<a href="https://wa.me/${SITE.whatsapp}" target="_blank" rel="noopener">WhatsApp</a>`);
    if (SITE.email) liens.push(`<a href="mailto:${SITE.email}">${echapper(SITE.email)}</a>`);
    if (SITE.rdv) liens.push(`<a href="${SITE.rdv}" target="_blank" rel="noopener">Appel découverte</a>`);
    const footer = document.getElementById("footer-links");
    if (footer) footer.innerHTML = liens.join(" · ");

    const zones = document.getElementById("infos-pratiques");
    if (zones) {
        zones.innerHTML =
            `<p class="zones">${echapper(SITE.zones)}</p>` +
            `<p>${SITE.infos.map(echapper).join(" — ")}</p>`;
    }
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
            <p class="formule-prix">${echapper(f.prix)}</p>
            <p class="formule-taux">${echapper(f.presence)} · ${echapper(f.tauxHoraire)}</p>
            <p class="formule-reels"><strong>${f.montages}</strong> montages Reels / TikTok</p>
            <p class="formule-accroche">${f.moments.map(echapper).join(" • ")}</p>
            <span class="btn btn-outline">Voir ce que je reçois</span>
        </a>`
    ).join("");
}

/* ---------- Page d'une formule ---------- */
function afficherFormule() {
    initCommun();
    const id = new URLSearchParams(location.search).get("f");
    const f = trouverFormule(id) || FORMULES[0];

    document.title = `Collection ${f.nom} — ${SITE.nom}`;
    document.getElementById("f-nom").textContent = f.nom;
    document.getElementById("f-prix").textContent = f.prix;
    document.getElementById("f-accroche").textContent = `${f.presence} · ${f.tauxHoraire}`;
    document.getElementById("f-titre-reels").innerHTML = `Vous recevez ${f.montages}&nbsp;réels`;

    const reels = [];
    for (let i = 0; i < f.montages; i++) {
        const src = f.videos[i];
        reels.push(
            src
                ? `<div class="reel"><video src="${src}" controls playsinline preload="metadata"></video></div>`
                : `<div class="reel reel-vide"><span class="play">&#9654;</span><span>Réel ${i + 1}</span><small>à venir</small></div>`
        );
    }
    document.getElementById("f-reels").innerHTML = reels.join("");

    document.getElementById("f-inclus").innerHTML = [
        f.presence,
        ...f.moments,
        `${f.montages} montages au choix (Reels / TikTok), livrés sous 48 h`,
    ].map((x) => `<li>${echapper(x)}</li>`).join("");
    document.getElementById("f-cta").href = `contact.html?f=${f.id}`;
}

/* ---------- Page contact ---------- */
function afficherContact() {
    initCommun();
    const id = new URLSearchParams(location.search).get("f");
    const select = document.getElementById("c-formule");
    select.innerHTML =
        FORMULES.map((f) => `<option value="${f.id}"${f.id === id ? " selected" : ""}>Collection ${echapper(f.nom)} — ${echapper(f.prix)}</option>`).join("") +
        `<option value="autre">Je ne sais pas encore</option>`;

    const form = document.getElementById("contact-form");
    const actions = document.getElementById("c-actions");
    const note = document.getElementById("c-note");

    const boutons = [];
    if (SITE.whatsapp) boutons.push('<button type="submit" class="btn btn-gold" data-via="whatsapp">Envoyer par WhatsApp</button>');
    if (SITE.email) boutons.push('<button type="submit" class="btn btn-outline" data-via="email">Envoyer par e-mail</button>');
    if (boutons.length === 0) {
        form.hidden = true;
        document.getElementById("form-title").hidden = true;
        note.textContent = "";
        return;
    }
    actions.innerHTML = boutons.join("");

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const via = e.submitter && e.submitter.dataset.via;
        const d = new FormData(form);
        const formule = trouverFormule(d.get("formule"));
        const texte = [
            `Bonjour, je suis intéressé(e) par la collection ${formule ? formule.nom : "(à définir)"} et je souhaite un devis.`,
            `Nom : ${d.get("nom")}`,
            d.get("tel") ? `Téléphone : ${d.get("tel")}` : "",
            d.get("date") ? `Date du mariage : ${d.get("date")}` : "",
            d.get("lieu") ? `Lieu : ${d.get("lieu")}` : "",
            d.get("message") ? `\n${d.get("message")}` : "",
        ].filter(Boolean).join("\n");

        if (via === "whatsapp") {
            window.open(`https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(texte)}`, "_blank");
        } else if (via === "email") {
            location.href = `mailto:${SITE.email}?subject=${encodeURIComponent("Demande de devis — " + (formule ? formule.nom : ""))}&body=${encodeURIComponent(texte)}`;
        }
    });
}
