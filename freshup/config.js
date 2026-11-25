/* =========================================================
   CONFIGURATION DU SITE FRESH UP — c'est le seul fichier à
   modifier pour changer les prix, les zones ou tes coordonnées.
   ========================================================= */

const SITE = {
    nom: "Fresh Up",

    // Numéro affiché sur le site
    telephone: "0696 10 21 77",
    // Le même numéro pour WhatsApp : indicatif sans le +, sans espaces
    whatsapp: "596696102177",
    instagram: "https://instagram.com/freshup.mq",

    // Lien Calendly pour réserver directement un créneau.
    // Si tu le laisses vide (""), la réservation se fait uniquement par WhatsApp.
    rdv: "https://calendly.com/freshup-mq",

    paiement: "Paiement sur place, après la prestation : carte ou espèces.",
};

/*  Les rubriques (onglets) et leurs prestations.
    Pour chaque prestation :
        nom   = ce qui est affiché
        prix  = le prix TTC en euros (null = sur devis)
        unite = (facultatif) "m²" si le prix est au mètre carré
        aPartirDe = (facultatif) true si c'est un prix de départ
*/
const RUBRIQUES = [
    {
        id: "canapes",
        nom: "Canapés & fauteuils",
        titre: "Lavage de canapés et fauteuils",
        photo: "img/photo-6.jpg",
        inclus: [
            "Nettoyage en profondeur par injection-extraction",
            "Détachage et élimination des mauvaises odeurs",
            "Poussière et acariens extraits du tissu",
        ],
        prestations: [
            { id: "fauteuil", nom: "Fauteuil individuel", prix: 39 },
            { id: "canape-2", nom: "Canapé 2 places", prix: 79 },
            { id: "canape-3", nom: "Canapé 3 places", prix: 99 },
            { id: "canape-4", nom: "Canapé 4 places", prix: 119 },
            { id: "canape-angle", nom: "Canapé d'angle / 5-6 places", prix: 149 },
            { id: "chaise", nom: "Chaise", prix: 15 },
        ],
    },
    {
        id: "matelas",
        nom: "Matelas",
        titre: "Lavage de matelas",
        photo: "img/photo-5.jpg",
        inclus: [
            "Nettoyage en profondeur par injection-extraction",
            "Traitement anti-acariens",
            "Taches, auréoles et odeurs",
        ],
        prestations: [
            { id: "matelas-enfant", nom: "Matelas enfant", prix: 45 },
            { id: "matelas-1", nom: "Matelas 1 place", prix: 59 },
            { id: "matelas-2", nom: "Matelas 2 places", prix: 79 },
            { id: "matelas-king", nom: "Matelas King Size", prix: 89 },
            { id: "matelas-face", nom: "Nettoyage de la deuxième face (par matelas)", prix: 25, supplement: true },
        ],
    },
    {
        id: "tapis",
        nom: "Tapis & moquettes",
        titre: "Lavage de tapis et moquettes",
        photo: "img/tapis.jpg",
        inclus: [
            "Shampoing et extraction des saletés",
            "Traitement anti-taches et désodorisant",
            "Fibres ravivées, séchage rapide",
        ],
        prestations: [
            { id: "tapis-2", nom: "Tapis jusqu'à 2 m²", prix: 49 },
            { id: "tapis-4", nom: "Tapis de 2 à 4 m²", prix: 69 },
            { id: "tapis-6", nom: "Tapis de 4 à 6 m²", prix: 89 },
            { id: "tapis-plus", nom: "Tapis de plus de 6 m²", prix: null },
            { id: "moquette", nom: "Moquette", prix: 9, unite: "m²", aPartirDe: true },
        ],
    },
];

/*  Frais de déplacement selon la commune (carte des zones).
    Pour changer une commune de zone, déplace-la dans la bonne liste.
*/
const ZONES = [
    { nom: "Zone 4", frais: 5, couleur: "#F7931E", communes: ["Fort-de-France", "Le Lamentin", "Saint-Joseph", "Schœlcher"] },
    { nom: "Zone 1", frais: 10, couleur: "#2EAD4B", communes: ["Bellefontaine", "Case-Pilote", "Ducos", "Le Gros-Morne", "Le Robert"] },
    { nom: "Zone 2", frais: 13, couleur: "#2F4FD8", communes: ["Fonds-Saint-Denis", "La Trinité", "Le Carbet", "Le François", "Le Morne-Rouge", "Le Morne-Vert", "Rivière-Salée", "Saint-Esprit", "Sainte-Luce", "Sainte-Marie"] },
    { nom: "Zone 3", frais: 15, couleur: "#E8318C", communes: ["Ajoupa-Bouillon", "Basse-Pointe", "Grand'Rivière", "Le Diamant", "Le Lorrain", "Le Marigot", "Le Marin", "Le Prêcheur", "Le Vauclin", "Les Anses-d'Arlet", "Les Trois-Îlets", "Macouba", "Rivière-Pilote", "Saint-Pierre", "Sainte-Anne"] },
];
