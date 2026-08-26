export const RESTAURANT = {
  name: "Dam'Oui",
  city: "Saint-Pierre-Quiberon",
  address: "15 Rue Général de Gaulle, 56510 Saint-Pierre-Quiberon",
  phone: "07 66 70 50 09",
  phoneHref: "tel:+33766705009",
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=Dam'Oui+15+Rue+G%C3%A9n%C3%A9ral+de+Gaulle+56510+Saint-Pierre-Quiberon",
  instagram: "https://www.instagram.com/damoui.restaurant/",
  hours: [
    { day: "Midi", time: "12:00 — 15:30" },
    { day: "Soir", time: "18:30 — 22:30" },
  ],
};

export const MENU = {
  note: "Une ardoise vivante, réécrite au fil des saisons, des retours de criée et des inspirations du chef.",
  sections: [
    {
      title: "Entrées",
      items: [
        {
          name: "Houmous & gyoza",
          desc: "pois chiche fumé, huile d'olive citronnée",
          price: "7",
          image: "/images/plat-toast-oeuf.png",
        },
        {
          name: "Gravlax de saumon",
          desc: "gin, betterave, crème raifort",
          price: "9",
          image: "/images/plat-tataki-thon.png",
        },
        {
          name: "Planche à partager",
          desc: "charcuteries, fromages, fritures",
          price: "8 / pers.",
          image: "/images/detail-cocktails.png",
        },
      ],
    },
    {
      title: "Plats",
      items: [
        {
          name: "Bœuf tigré",
          desc: "frites maison, jus corsé aux épices douces",
          price: "22,5",
          image: "/images/plat-tataki-thon.png",
        },
        {
          name: "Tentacule de poulpe",
          desc: "grillé au charbon, condiment chermoula",
          price: "24",
          image: "/images/plat-toast-oeuf.png",
        },
        {
          name: "Risotto chorizo & bodega",
          desc: "crémeux, éclats de parmesan",
          price: "19,5",
          image: "/images/plat-pates-burrata.png",
        },
        {
          name: "Poulet croustillant teriyaki",
          desc: "pain pita, pickles d'oignon, frites maison",
          price: "16,5",
          image: "/images/plat-poulet-crispy.png",
        },
      ],
    },
    {
      title: "Douceurs",
      items: [
        {
          name: "Cheesecake de la maison",
          desc: "coulis de fruits rouges, chantilly vanillée",
          price: "8,5",
          image: "/images/dessert-cheesecake.png",
        },
        {
          name: "Tarte chocolat signature",
          desc: "vagues de ganache, fleur de sel",
          price: "9",
          image: "/images/equipe-gateau.png",
        },
      ],
    },
  ],
};

export const GALLERY = [
  { src: "/images/salle-banquette.png", alt: "La salle et ses banquettes", size: "tall" },
  { src: "/images/plat-toast-oeuf.png", alt: "Toast, œuf parfait, mangue" },
  { src: "/images/detail-cocktails.png", alt: "Cocktails au bar", size: "tall" },
  { src: "/images/plat-poulet-crispy.png", alt: "Poulet croustillant, vermicelles" },
  { src: "/images/salle-bar.png", alt: "Le bar et la pierre apparente", size: "wide" },
  { src: "/images/plat-pates-burrata.png", alt: "Pâtes fraîches, burrata" },
  { src: "/images/enseigne-terrasse.png", alt: "La terrasse à la nuit tombée", size: "tall" },
  { src: "/images/dessert-cheesecake.png", alt: "Cheesecake & espresso martini" },
];

export const REVIEWS = {
  score: "4,9",
  count: "403 avis Google",
  quotes: [
    {
      text: "Mon mari a pris le bœuf tigré et moi une salade mangue, saumon et burrata. Les deux étaient excellents ! Le dessert aussi, d'ailleurs.",
      author: "Nathalie",
      source: "Avis Google",
    },
    {
      text: "Nous venons régulièrement à Saint-Pierre et ne manquons jamais de venir déjeuner au Dam'Oui. Plats originaux, poissons toujours frais et service de grande qualité.",
      author: "Un habitué",
      source: "Pages Jaunes",
    },
    {
      text: "Autodidacte inspiré ayant longtemps enchaîné les saisons sur la presqu'île, Ferdinand Bakha avait envie d'ouvrir sa propre enseigne.",
      author: "Petit Futé",
      source: "Guide 2026",
    },
  ],
};
