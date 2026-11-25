/* Affichage du site à partir de config.js — normalement pas besoin de modifier ce fichier. */

function echapper(texte) {
    const div = document.createElement("div");
    div.textContent = texte;
    return div.innerHTML;
}

function euros(n) {
    return n.toLocaleString("fr-FR", { maximumFractionDigits: 2 }) + " €";
}

function lienWhatsApp(texte) {
    return `https://wa.me/${SITE.whatsapp}` + (texte ? `?text=${encodeURIComponent(texte)}` : "");
}

/* Le panier et la commune sont gardés pendant la visite (si le navigateur le permet). */
const memoire = {
    lire(cle, defaut) {
        try { return JSON.parse(sessionStorage.getItem("freshup-" + cle)) ?? defaut; } catch { return defaut; }
    },
    ecrire(cle, valeur) {
        try { sessionStorage.setItem("freshup-" + cle, JSON.stringify(valeur)); } catch { /* navigation privée */ }
    },
};

/* ---------- Commun à toutes les pages ---------- */
function initCommun() {
    document.querySelectorAll("[data-tel]").forEach((el) => {
        el.href = "tel:" + SITE.telephone.replace(/\s/g, "");
        el.textContent = SITE.telephone;
    });
    document.querySelectorAll("[data-paiement]").forEach((el) => (el.textContent = SITE.paiement));
    const liens = [
        `<a href="${lienWhatsApp("Bonjour Fresh Up, je voudrais un renseignement.")}" target="_blank" rel="noopener">WhatsApp ${echapper(SITE.telephone)}</a>`,
        `<a href="${SITE.instagram}" target="_blank" rel="noopener">Instagram @freshup.mq</a>`,
        "Partout en Martinique",
    ];
    document.getElementById("footer-links").innerHTML = liens.join(" · ");
}

/* ---------- Page d'accueil : le canapé avant / après ---------- */
function initAvantApres() {
    const bloc = document.getElementById("avant-apres");
    const apres = document.getElementById("aa-apres");
    const ligne = document.getElementById("aa-ligne");
    const poignee = document.getElementById("aa-poignee");
    document.getElementById("aa-avant").innerHTML = `<img src="${SITE.avant}" alt="Canapé taché avant nettoyage" draggable="false">`;
    apres.innerHTML = `<img src="${SITE.apres}" alt="Le même canapé propre après nettoyage" draggable="false">`;

    const biais = 8; // inclinaison de la séparation, en % de la largeur
    function placer(pos) {
        pos = Math.min(100, Math.max(0, pos));
        apres.style.clipPath = `polygon(${pos + biais}% 0, 100% 0, 100% 100%, ${pos - biais}% 100%)`;
        ligne.style.left = pos + "%";
        poignee.setAttribute("aria-valuenow", Math.round(pos));
        bloc.dataset.pos = pos;
    }

    let glisse = false;
    const depuisPointeur = (e) => {
        const r = bloc.getBoundingClientRect();
        placer(((e.clientX - r.left) / r.width) * 100);
    };
    bloc.addEventListener("pointerdown", (e) => { glisse = true; bloc.setPointerCapture(e.pointerId); depuisPointeur(e); });
    bloc.addEventListener("pointermove", (e) => { if (glisse) depuisPointeur(e); });
    bloc.addEventListener("pointerup", () => (glisse = false));
    bloc.addEventListener("pointercancel", () => (glisse = false));
    poignee.addEventListener("keydown", (e) => {
        const pas = { ArrowLeft: -5, ArrowRight: 5 }[e.key];
        if (pas) { e.preventDefault(); placer(parseFloat(bloc.dataset.pos) + pas); }
    });

    placer(50);
    // Petit aller-retour au chargement pour montrer qu'on peut faire glisser
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
        const debut = performance.now();
        const anim = (t) => {
            if (glisse) return;
            const p = Math.min(1, (t - debut) / 1800);
            placer(50 - 22 * Math.sin(p * Math.PI * 2) * (1 - p));
            if (p < 1) requestAnimationFrame(anim);
        };
        setTimeout(() => requestAnimationFrame(anim), 600);
    }
}

function afficherChoix() {
    document.getElementById("choix-boutons").innerHTML = RUBRIQUES.map(
        (r) => `
        <a href="service.html#${r.id}" class="choix-btn">
            <span class="choix-nom">${echapper(r.bouton)}</span>
            ${r.prixAccueil ? `<span class="choix-prix">dès ${euros(r.prixAccueil)}</span>` : ""}
        </a>`
    ).join("");
}

/* ---------- Page tarifs et réservation ---------- */
let panier = {};
let communeChoisie = "";

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

function rubriqueCourante() {
    const id = location.hash.slice(1);
    return RUBRIQUES.find((r) => r.id === id) || RUBRIQUES[0];
}

function afficherService() {
    const r = rubriqueCourante();
    document.getElementById("pills").innerHTML = RUBRIQUES.map(
        (x) => `<a href="#${x.id}" class="pill${x.id === r.id ? " actif" : ""}">${echapper(x.nom)}</a>`
    ).join("");
    const photo = document.getElementById("s-photo");
    photo.src = r.photo;
    photo.alt = r.nom;
    document.getElementById("s-nom").textContent = r.nom;
    document.getElementById("s-inclus").textContent = r.inclus;
    document.getElementById("s-prestations").innerHTML = r.prestations.map(lignePrestation).join("");

    document.querySelectorAll("[data-plus], [data-moins]").forEach((bouton) =>
        bouton.addEventListener("click", () => {
            const id = bouton.dataset.plus || bouton.dataset.moins;
            panier[id] = Math.max(0, (panier[id] || 0) + (bouton.dataset.plus ? 1 : -1));
            majEstimation();
        })
    );
    document.querySelectorAll("[data-m2]").forEach((champ) => {
        champ.value = panier[champ.dataset.m2] || "";
        champ.addEventListener("input", () => {
            panier[champ.dataset.m2] = Math.max(0, parseFloat(champ.value.replace(",", ".")) || 0);
            majEstimation();
        });
    });
    majEstimation();
}

function lignePrestation(p) {
    const commande = p.unite
        ? `<label class="m2"><input type="number" min="0" step="0.5" inputmode="decimal" placeholder="0" data-m2="${p.id}" aria-label="Surface en ${p.unite}"> ${echapper(p.unite)}</label>`
        : `<div class="stepper">
               <button type="button" data-moins="${p.id}" aria-label="Retirer">−</button>
               <span data-qte="${p.id}">0</span>
               <button type="button" data-plus="${p.id}" aria-label="Ajouter">+</button>
           </div>`;
    return `
        <li class="prestation" data-ligne="${p.id}">
            <span class="prestation-nom">${echapper(p.nom)}</span>
            <span class="prestation-prix">${prixAffiche(p)}</span>
            ${commande}
        </li>`;
}

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
    const vide = lignes.length === 0;
    const totalTexte = vide ? "—" : (aPartirDe ? "dès " : "") + euros(total) + (surDevis ? " + devis" : "");
    return { lignes, total, surDevis, aPartirDe, frais, vide, totalTexte };
}

function majEstimation() {
    memoire.ecrire("panier", panier);
    document.querySelectorAll("[data-qte]").forEach((el) => (el.textContent = panier[el.dataset.qte] || 0));
    document.querySelectorAll("[data-ligne]").forEach((el) => el.classList.toggle("choisi", (panier[el.dataset.ligne] || 0) > 0));

    const e = calculer();
    document.getElementById("estim-lignes").innerHTML = e.vide
        ? `<li class="estim-vide">Rien pour l'instant : ajoute une prestation avec +.</li>`
        : e.lignes.map((l) => `<li><span>${echapper(l.texte)}</span><span>${echapper(l.montant)}</span></li>`).join("");
    document.getElementById("estim-total").textContent = e.totalTexte;
    document.getElementById("barre-total").textContent = e.totalTexte;
    document.getElementById("barre-mobile").classList.toggle("visible", !e.vide);

    const notes = [];
    if (!e.vide && e.frais === null) notes.push("Choisis ta commune pour ajouter le déplacement.");
    if (e.surDevis) notes.push("Tapis de plus de 6 m² : prix sur devis.");
    if (e.aPartirDe) notes.push("Moquette : prix de départ.");
    notes.push("Prix confirmé sur place selon la taille et l'état.");
    document.getElementById("estim-note").textContent = notes.join(" ");
    majLiensReservation();
}

/* Le récapitulatif de la demande, pour WhatsApp et pour les notes du rendez-vous Calendly. */
function texteDemande(f, e) {
    return [
        ...e.lignes.map((l) => `• ${l.texte} : ${l.montant}`),
        e.vide ? "" : `Total estimé : ${e.totalTexte}`,
        "",
        `Téléphone : ${f.get("tel")}`,
        `Commune : ${f.get("commune")}${f.get("adresse") ? " (" + f.get("adresse") + ")" : ""}`,
        f.get("message") ? `Précisions : ${f.get("message")}` : "",
        "",
        "Paiement sur place après la prestation.",
    ]
        .filter((ligne, i, tout) => ligne !== "" || (i > 0 && tout[i - 1] !== ""))
        .join("\n")
        .trim();
}

/* Les boutons de réservation sont de vrais liens, mis à jour à chaque changement :
   plus fiable qu'une fenêtre ouverte par script, que certains navigateurs bloquent. */
function majLiensReservation() {
    const form = document.getElementById("form-rdv");
    const f = new FormData(form);
    const e = calculer();

    const calendly = form.querySelector('[data-action="calendly"]');
    if (calendly) {
        const url = new URL(SITE.rdv);
        if (f.get("nom")) url.searchParams.set("name", f.get("nom"));
        url.searchParams.set("a1", texteDemande(f, e));
        calendly.href = url.toString();
    }
    const message = ["Bonjour Fresh Up, je souhaite réserver un nettoyage.", "", `Nom : ${f.get("nom")}`, texteDemande(f, e), "", "Quels créneaux avez-vous de disponibles ?"].join("\n");
    form.querySelector('[data-action="whatsapp"]').href = lienWhatsApp(message);
}

function verifierDemande(evenement) {
    const form = document.getElementById("form-rdv");
    const erreur = document.getElementById("form-erreur");
    if (!form.reportValidity()) {
        evenement.preventDefault();
        erreur.textContent = "Remplis ta commune, ton nom et ton téléphone.";
        return;
    }
    if (calculer().vide && !String(new FormData(form).get("message")).trim()) {
        evenement.preventDefault();
        erreur.textContent = "Ajoute au moins une prestation, ou décris ton besoin dans les précisions.";
        return;
    }
    erreur.textContent = "";
    majLiensReservation();
}

function initReservation() {
    const toutes = ZONES.flatMap((z) => z.communes).sort((a, b) => a.localeCompare(b, "fr"));
    const select = document.getElementById("commune");
    select.innerHTML = `<option value="">Choisir…</option>` + toutes.map((c) => `<option>${echapper(c)}</option>`).join("");
    select.value = communeChoisie;
    select.addEventListener("change", () => {
        communeChoisie = select.value;
        memoire.ecrire("commune", communeChoisie);
        majEstimation();
    });

    const form = document.getElementById("form-rdv");
    form.addEventListener("submit", (e) => e.preventDefault());
    form.addEventListener("input", majLiensReservation);
    form.querySelectorAll("[data-action]").forEach((lien) => lien.addEventListener("click", verifierDemande));
    // Sans lien d'agenda, la réservation se fait uniquement par WhatsApp
    if (!SITE.rdv) {
        form.querySelector('[data-action="calendly"]').remove();
        const whatsapp = form.querySelector('[data-action="whatsapp"]');
        whatsapp.classList.remove("btn-ligne");
        whatsapp.textContent = "Réserver par WhatsApp";
    }
    // La barre du bas sur mobile ne doit pas cacher le formulaire
    new IntersectionObserver(([entree]) =>
        document.getElementById("barre-mobile").classList.toggle("masquee", entree.isIntersecting)
    ).observe(document.getElementById("reserver"));
}

/* ---------- Démarrage ---------- */
initCommun();
if (document.body.classList.contains("page-accueil")) {
    initAvantApres();
    afficherChoix();
} else {
    panier = memoire.lire("panier", {});
    communeChoisie = memoire.lire("commune", "");
    initReservation();
    afficherService();
    window.addEventListener("hashchange", () => {
        afficherService();
        window.scrollTo({ top: 0 });
    });
}
