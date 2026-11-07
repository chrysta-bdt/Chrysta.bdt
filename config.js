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
    instagram: "https://instagram.com/linstant.reel",

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
    - videos : tes réels. Pour chaque vidéo :
        src    = le fichier .mp4 dans le dossier videos/
        poster = l'image affichée avant la lecture (dossier posters/)
        titre  = le titre du réel, couple = les mariés, lieu = où et quand
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
            { src: "videos/trend-mariee.mp4", poster: "posters/trend-mariee.jpg", titre: "Avant, après : la mariée", couple: "Trend", lieu: "" },
            { src: "videos/film-4.mp4", poster: "posters/film-4.jpg", titre: "Le oui à la mairie", couple: "Djeremy & Kathleen", lieu: "Martinique · octobre 2026" },
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
        videos: [
            { src: "videos/spontane-demoiselles.mp4", poster: "posters/spontane-demoiselles.jpg", titre: "La mariée et ses demoiselles", couple: "Spontané", lieu: "" },
            { src: "videos/hero.mp4", poster: "posters/film-7.jpg", titre: "La cérémonie au jardin", couple: "Kelia & Jose", lieu: "" },
            { src: "videos/film-1.mp4", poster: "posters/film-1.jpg", titre: "Cérémonie et réception", couple: "Brice & Audrey", lieu: "octobre 2025" },
        ],
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
        videos: [
            { src: "videos/film-3.mp4", poster: "posters/film-3.jpg", titre: "Le mariage civil", couple: "Maud & Ruben", lieu: "Martinique · août 2026" },
            { src: "videos/film-5.mp4", poster: "posters/film-5.jpg", titre: "Toute la journée", couple: "Giovanna & Maxime", lieu: "Martinique · juillet 2026" },
            { src: "videos/film-6.mp4", poster: "posters/film-6.jpg", titre: "De la cérémonie à la fête", couple: "Gabrielle & Didier", lieu: "Martinique" },
            { src: "videos/film-2.mp4", poster: "posters/film-2.jpg", titre: "Unis pour la vie", couple: "Nicole & Nathan", lieu: "Guadeloupe" },
        ],
    },
];
