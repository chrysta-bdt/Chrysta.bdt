/* Affichage du site à partir de config.js — normalement pas besoin de modifier ce fichier. */

const panier = {}; // id de prestation -> quantité (ou m² pour un prix au m²)
let communeChoisie = "";

function echapper(texte) {
    const div = document.createElement("div");
    div.textContent = texte;
    return div.innerHTML;
}

function euros(n) {
    return n.toLocaleString("fr-FR", { maximumFractionDigits: 2 }) + " €";
}

function toutesLesPrestations() {
    return RUBRIQUES.flatMap((r) => r.prestations);
}

function fraisCommune(commune) {
    const zone = ZONES.find((z) => z.communes.includes(commune));
    return zone ? zone.frais : null;
}

function prixAffiche(p) {
    if (p.prix === null) return "Sur devis";
    const base = (p.aPartirDe ? "Dès " : "") + euros(p.prix) + (p.unite ? " / " + p.unite : "");
    return p.supplement ? "+ " + base : base;
}

/* ---------- Vidéo de couverture ---------- */
function choisirVideoHero() {
    const video = document.getElementById("hero-video");
    const portrait = window.innerHeight > window.innerWidth;
    video.src = portrait ? "video/hero-mobile.mp4" : "video/hero-desktop.mp4";
}

/* ---------- Onglets et prestations ---------- */
function afficherRubriques() {
    document.getElementById("onglets").innerHTML = RUBRIQUES.map(
        (r, i) => `<button type="button" role="tab" class="tab${i === 0 ? " actif" : ""}" data-onglet="${r.id}">${echapper(r.nom)}</button>`
    ).join("");

    document.getElementById("rubriques").innerHTML = RUBRIQUES.map(
        (r, i) => `
        <div class="rubrique${i === 0 ? " actif" : ""}" id="rubrique-${r.id}">
            <div class="rubrique-entete">
                <img src="${r.photo}" alt="${echapper(r.titre)}" loading="lazy">
                <div>
                    <h3>${echapper(r.titre)}</h3>
                    <ul class="check-list">${r.inclus.map((x) => `<li>${echapper(x)}</li>`).join("")}</ul>
                </div>
            </div>
            <ul class="prestations">
                ${r.prestations.map(lignePrestation).join("")}
            </ul>
        </div>`
    ).join("");

    document.querySelectorAll("[data-onglet]").forEach((bouton) =>
        bouton.addEventListener("click", () => ouvrirOnglet(bouton.dataset.onglet))
    );
    document.querySelectorAll("[data-plus], [data-moins]").forEach((bouton) =>
        bouton.addEventListener("click", () => {
            const id = bouton.dataset.plus || bouton.dataset.moins;
            const qte = (panier[id] || 0) + (bouton.dataset.plus ? 1 : -1);
            panier[id] = Math.max(0, qte);
            majEstimation();
        })
    );
    document.querySelectorAll("[data-m2]").forEach((champ) =>
        champ.addEventListener("input", () => {
            panier[champ.dataset.m2] = Math.max(0, parseFloat(champ.value.replace(",", ".")) || 0);
            majEstimation();
        })
    );
}

function lignePrestation(p) {
    const commande = p.unite
        ? `<label class="m2"><input type="number" min="0" step="0.5" inputmode="decimal" placeholder="0" data-m2="${p.id}"> ${echapper(p.unite)}</label>`
        : `<div class="stepper">
               <button type="button" data-moins="${p.id}" aria-label="Retirer">−</button>
               <span data-qte="${p.id}">0</span>
               <button type="button" data-plus="${p.id}" aria-label="Ajouter">+</button>
           </div>`;
    return `
        <li class="prestation" data-ligne="${p.id}">
            <div class="prestation-nom">${echapper(p.nom)}</div>
            <div class="prestation-prix">${prixAffiche(p)}</div>
            ${commande}
        </li>`;
}

function ouvrirOnglet(id) {
    document.querySelectorAll("[data-onglet]").forEach((b) => b.classList.toggle("actif", b.dataset.onglet === id));
    document.querySelectorAll(".rubrique").forEach((r) => r.classList.toggle("actif", r.id === "rubrique-" + id));
}

/* ---------- Estimation ---------- */
function calculer() {
    const lignes = [];
    let total = 0;
    let surDevis = false;
    let aPartirDe = false;

    toutesLesPrestations().forEach((p) => {
        const qte = panier[p.id] || 0;
        if (!qte) return;
        if (p.prix === null) {
            surDevis = true;
            lignes.push({ texte: `${qte} × ${p.nom}`, montant: "Sur devis" });
            return;
        }
        const montant = p.prix * qte;
        total += montant;
        if (p.aPartirDe) aPartirDe = true;
        const quantite = p.unite ? `${qte.toLocaleString("fr-FR")} ${p.unite}` : `${qte} ×`;
        lignes.push({ texte: `${quantite} ${p.nom}`, montant: euros(montant) });
    });

    const frais = fraisCommune(communeChoisie);
    if (lignes.length && frais !== null) {
        total += frais;
        lignes.push({ texte: `Déplacement (${communeChoisie})`, montant: euros(frais) });
    }
    return { lignes, total, surDevis, aPartirDe, frais };
}

function majEstimation() {
    document.querySelectorAll("[data-qte]").forEach((el) => (el.textContent = panier[el.dataset.qte] || 0));
    document.querySelectorAll("[data-ligne]").forEach((el) => el.classList.toggle("choisi", (panier[el.dataset.ligne] || 0) > 0));

    const e = calculer();
    const vide = e.lignes.length === 0;

    document.getElementById("estim-lignes").innerHTML = vide
        ? `<li class="estim-vide">Ajoute un canapé, un matelas ou un tapis avec le bouton +.</li>`
        : e.lignes.map((l) => `<li><span>${echapper(l.texte)}</span><span>${echapper(l.montant)}</span></li>`).join("");

    let totalTexte = "—";
    if (!vide) totalTexte = (e.aPartirDe ? "dès " : "") + euros(e.total) + (e.surDevis ? " + devis" : "");
    document.getElementById("estim-total").textContent = totalTexte;
    document.getElementById("barre-total").textContent = totalTexte;
    document.getElementById("barre-mobile").classList.toggle("visible", !vide);

    const notes = [];
    if (!vide && e.frais === null) notes.push("Choisis ta commune pour ajouter les frais de déplacement.");
    if (e.surDevis) notes.push("Tapis de plus de 6 m² : prix donné sur devis.");
    if (e.aPartirDe) notes.push("Moquette : prix de départ, confirmé sur place.");
    notes.push("Prix estimé TTC, confirmé sur place selon la taille et l'état.");
    document.getElementById("estim-note").textContent = notes.join(" ");

    document.getElementById("recap").innerHTML = vide
        ? `<p class="recap-vide">Tu n'as encore rien choisi. <a href="#tarifs">Estime ton prix</a>, ou décris ton besoin dans les précisions.</p>`
        : `<p class="recap-titre">Ta demande</p>
           <ul>${e.lignes.map((l) => `<li><span>${echapper(l.texte)}</span><span>${echapper(l.montant)}</span></li>`).join("")}</ul>
           <p class="recap-total"><span>Total estimé</span><strong>${echapper(totalTexte)}</strong></p>`;
}

/* ---------- Communes et zones ---------- */
function afficherCommunes() {
    const toutes = ZONES.flatMap((z) => z.communes).sort((a, b) => a.localeCompare(b, "fr"));
    const options = `<option value="">Choisir…</option>` + toutes.map((c) => `<option>${echapper(c)}</option>`).join("");
    ["commune", "commune-form"].forEach((id) => {
        const select = document.getElementById(id);
        select.innerHTML = options;
        select.addEventListener("change", () => {
            communeChoisie = select.value;
            document.getElementById("commune").value = communeChoisie;
            document.getElementById("commune-form").value = communeChoisie;
            majEstimation();
        });
    });

    document.getElementById("zones-grid").innerHTML = [...ZONES]
        .sort((a, b) => a.frais - b.frais)
        .map(
            (z) => `
            <div class="zone" style="--zone:${z.couleur}">
                <p class="zone-prix">${euros(z.frais)}</p>
                <p class="zone-nom">${echapper(z.nom)}</p>
                <p class="zone-communes">${z.communes.map(echapper).join(" · ")}</p>
            </div>`
        )
        .join("");
}

/* ---------- Réservation ---------- */
function lienWhatsApp(texte) {
    return `https://wa.me/${SITE.whatsapp}` + (texte ? `?text=${encodeURIComponent(texte)}` : "");
}

function envoyerDemande(evenement) {
    evenement.preventDefault();
    const f = new FormData(evenement.target);
    const e = calculer();
    const erreur = document.getElementById("form-erreur");
    if (!e.lignes.length && !String(f.get("message")).trim()) {
        erreur.textContent = "Ajoute au moins une prestation dans l'estimation, ou décris ton besoin dans les précisions.";
        return;
    }
    erreur.textContent = "";

    const date = f.get("date") ? new Date(f.get("date") + "T12:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" }) : "";
    const message = [
        "Bonjour Fresh Up, je souhaite réserver un nettoyage.",
        "",
        ...e.lignes.map((l) => `• ${l.texte} : ${l.montant}`),
        e.lignes.length ? `Total estimé : ${document.getElementById("estim-total").textContent}` : "",
        "",
        `Nom : ${f.get("nom")}`,
        `Téléphone : ${f.get("tel")}`,
        `Commune : ${f.get("commune")}${f.get("adresse") ? " (" + f.get("adresse") + ")" : ""}`,
        `Jour souhaité : ${date} — ${f.get("moment")}`,
        f.get("message") ? `Précisions : ${f.get("message")}` : "",
        "",
        "Paiement sur place après la prestation.",
    ]
        .filter((ligne, i, tout) => ligne !== "" || tout[i - 1] !== "")
        .join("\n");

    window.open(lienWhatsApp(message), "_blank", "noopener");
}

function initReservation() {
    const demain = new Date();
    demain.setDate(demain.getDate() + 1);
    const champDate = document.getElementById("date-rdv");
    champDate.min = demain.toISOString().slice(0, 10);

    document.getElementById("form-rdv").addEventListener("submit", envoyerDemande);
    document.querySelectorAll("[data-rdv]").forEach((el) => {
        if (SITE.rdv) el.href = SITE.rdv;
        else el.remove();
    });
}

/* ---------- Commun ---------- */
function initCommun() {
    document.querySelectorAll("[data-whatsapp]").forEach((el) => {
        el.href = lienWhatsApp("Bonjour Fresh Up, je voudrais un renseignement.");
        el.target = "_blank";
        el.rel = "noopener";
    });
    document.querySelectorAll("[data-paiement]").forEach((el) => (el.textContent = SITE.paiement));

    const liens = [
        `<a href="tel:${SITE.telephone.replace(/\s/g, "")}">${echapper(SITE.telephone)}</a>`,
        `<a href="${lienWhatsApp("")}" target="_blank" rel="noopener">WhatsApp</a>`,
    ];
    if (SITE.instagram) liens.push(`<a href="${SITE.instagram}" target="_blank" rel="noopener">Instagram @freshup.mq</a>`);
    document.getElementById("footer-links").innerHTML = liens.join(" · ");
}

choisirVideoHero();
initCommun();
afficherRubriques();
afficherCommunes();
initReservation();
majEstimation();
