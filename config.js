/* =========================================================
   CONFIGURATION DU SITE — c'est le seul fichier à modifier
   pour changer les prix, les réels et tes coordonnées.
   ========================================================= */

const SITE = {
    nom: "L'Instant Réel",
    slogan: "Vos plus beaux moments, livrés en réels le jour J",

    // Coordonnées pour recevoir les demandes de devis / rendez-vous.
    // Laisse "" si tu ne veux pas utiliser l'un des deux.
    email: "",              // ex : "contact@linstantreel.fr"
    whatsapp: "",           // ex : "596696123456" (indicatif sans le +, sans espaces)
    instagram: "",          // ex : "https://instagram.com/linstantreel"
};

/*  Les 3 formules, de la moins chère à la plus chère.
    - prix : laisse "" pour afficher « Sur devis »
    - reels : nombre de réels livrés le jour J
    - inclus : ce que la personne reçoit
    - videos : chemins vers tes réels (fichiers .mp4 dans le dossier videos/)
      S'il y a moins de vidéos que de réels, un emplacement « Réel à venir » s'affiche.
*/
const FORMULES = [
    {
        id: "intime",
        nom: "Intime",
        accroche: "L'essentiel de votre journée, en toute simplicité.",
        prix: "",
        reels: 2,
        inclus: [
            "2 réels montés et livrés le jour J",
            "Format vertical prêt pour Instagram et TikTok",
            "Musique tendance au choix",
        ],
        videos: [
            // "videos/intime-1.mp4",
            // "videos/intime-2.mp4",
        ],
    },
    {
        id: "signature",
        nom: "Signature",
        accroche: "Les moments forts de votre journée, racontés avec style.",
        prix: "",
        reels: 4,
        inclus: [
            "4 réels montés et livrés le jour J",
            "Format vertical prêt pour Instagram et TikTok",
            "Musique tendance au choix",
            "Toutes les vidéos brutes envoyées",
        ],
        videos: [],
        populaire: true,
    },
    {
        id: "eternite",
        nom: "Éternité",
        accroche: "Une couverture complète pour revivre chaque instant.",
        prix: "",
        reels: 6,
        inclus: [
            "6 réels montés et livrés le jour J",
            "Format vertical prêt pour Instagram et TikTok",
            "Musique tendance au choix",
            "Toutes les vidéos brutes envoyées",
            "Présence de la préparation jusqu'à la soirée",
        ],
        videos: [],
    },
];
