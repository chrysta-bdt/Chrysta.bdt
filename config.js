/* =========================================================
   CONFIGURATION DU SITE — c'est le seul fichier à modifier
   pour changer les prix, les réels et tes coordonnées.
   ========================================================= */

const SITE = {
    nom: "L'Instant Réel",
    metier: "Créatrice de contenu mariage",

    // Lien pour réserver un appel découverte
    rdv: "https://cal.com/l-instant.reel/appel-decouverte",

    // Coordonnées pour recevoir les demandes de devis.
    // Laisse "" si tu ne veux pas utiliser l'un des deux.
    email: "chrysta.bd@gmail.com",
    whatsapp: "",           // ex : "596696123456" (indicatif sans le +, sans espaces)
    instagram: "",          // ex : "https://instagram.com/linstantreel"

    // Informations affichées sous les formules
    zones: "Martinique • Guadeloupe • Partout dans le monde",
    infos: [
        "Heure supplémentaire : 60 €",
        "Déplacements hors Martinique sur devis",
    ],
};

/*  Les 3 formules, de la moins chère à la plus chère.
    - montages : nombre de réels livrés
    - moments : ce qui est filmé
    - videos : chemins vers tes réels (fichiers .mp4 dans le dossier videos/)
      S'il y a moins de vidéos que de montages, un emplacement « Réel à venir » s'affiche.
*/
const FORMULES = [
    {
        id: "intime",
        nom: "Intime",
        prix: "240 €",
        tauxHoraire: "60 € / h",
        presence: "4 h de présence",
        montages: 2,
        moments: ["Préparatifs", "Cérémonie", "Shooting couple"],
        videos: [
            // "videos/intime-1.mp4",
            // "videos/intime-2.mp4",
        ],
    },
    {
        id: "signature",
        nom: "Signature",
        prix: "480 €",
        tauxHoraire: "60 € / h",
        presence: "8 h de présence",
        montages: 3,
        moments: ["Préparatifs", "Cérémonie religieuse ou laïque", "Shooting vidéo couple", "Réception"],
        videos: [],
        populaire: true,
    },
    {
        id: "eternite",
        nom: "Éternité",
        prix: "720 €",
        tauxHoraire: "60 € / h",
        presence: "12 h de présence",
        montages: 4,
        moments: [
            "Préparatifs",
            "Cérémonie civile (captation) et cérémonie religieuse",
            "Shooting vidéo couple",
            "Réception",
            "Lancer de bouquet",
        ],
        videos: [],
    },
];
