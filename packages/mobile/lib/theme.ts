export const colors = {
  bgPrimary: "#0A0A0F",
  bgSecondary: "#12121A",
  bgCard: "#1A1A26",
  accentGold: "#D4AF37",
  accentRoseGold: "#B76E79",
  accentAmber: "#FFBF00",
  textPrimary: "#F5F5F0",
  textMuted: "#8A8A9A",
  border: "#2A2A3A",
  success: "#2ECC71",
  danger: "#E74C3C",
  info: "#4A90D9",
  purple: "#7B68EE",
};

export const CATEGORIES = [
  // Nuit & Luxe
  { id: "nightlife",     label: "Nightlife",       icon: "🎵", color: "#D4145A", group: "nuit" },
  { id: "vip",           label: "VIP / Privé",     icon: "💎", color: "#D4AF37", group: "nuit" },
  { id: "entertainment", label: "Entertainment",   icon: "🎭", color: "#9B59B6", group: "nuit" },
  { id: "dating",        label: "Rencontres",      icon: "❤️", color: "#E91E8C", group: "nuit" },

  // Mobilité
  { id: "transport",     label: "Transport",       icon: "🚗", color: "#4A90D9", group: "mobilite" },

  // Logement
  { id: "hebergement",   label: "Hébergement",     icon: "🏨", color: "#7B68EE", group: "logement" },
  { id: "location",      label: "Location",        icon: "🔑", color: "#FF6B35", group: "logement" },
  { id: "colocation",    label: "Colocation",      icon: "🏠", color: "#5DADE2", group: "logement" },

  // Food
  { id: "restauration",  label: "Restauration",    icon: "🍽️", color: "#E8A838", group: "food" },
  { id: "traiteur",      label: "Chef / Traiteur", icon: "👨‍🍳", color: "#F39C12", group: "food" },

  // Emploi
  { id: "emploi",        label: "Emploi nuit",     icon: "💼", color: "#2ECC71", group: "emploi" },
  { id: "emploi_jour",   label: "Emploi jour",     icon: "🧑‍💻", color: "#1ABC9C", group: "emploi" },

  // Maison & Services
  { id: "menage",        label: "Ménage",          icon: "🧹", color: "#85C1E9", group: "maison" },
  { id: "jardinage",     label: "Jardinage",       icon: "🌿", color: "#27AE60", group: "maison" },
  { id: "bricolage",     label: "Bricolage",       icon: "🔨", color: "#E67E22", group: "maison" },
  { id: "travaux",       label: "Travaux",         icon: "🏗️", color: "#CA6F1E", group: "maison" },
  { id: "demenagement",  label: "Déménagement",    icon: "📦", color: "#7F8C8D", group: "maison" },
  { id: "mecanique",     label: "Mécanique",       icon: "🔧", color: "#95A5A6", group: "maison" },

  // Beauté & Bien-être
  { id: "beaute",        label: "Beauté",          icon: "💅", color: "#F1948A", group: "bienetre" },
  { id: "coiffure",      label: "Coiffure",        icon: "✂️", color: "#EC407A", group: "bienetre" },
  { id: "sport",         label: "Sport / Coach",   icon: "🏋️", color: "#EB984E", group: "bienetre" },
  { id: "sante",         label: "Santé / Kiné",    icon: "🏥", color: "#82E0AA", group: "bienetre" },

  // Sports & Loisirs
  { id: "five",          label: "Five / Foot",     icon: "⚽", color: "#2ECC71", group: "sport" },
  { id: "paddle",        label: "Paddle / Tennis", icon: "🎾", color: "#F4D03F", group: "sport" },
  { id: "nautique",      label: "Sports nautiques",icon: "🏄", color: "#1A8CFF", group: "sport" },
  { id: "loisirs",       label: "Loisirs",         icon: "🎲", color: "#AF7AC5", group: "sport" },

  // Musique
  { id: "studio",        label: "Studio",          icon: "🎙️", color: "#E74C3C", group: "musique" },
  { id: "musiciens",     label: "Musiciens",       icon: "🎸", color: "#8E44AD", group: "musique" },
  { id: "dj",            label: "DJ / Prod",       icon: "🎧", color: "#D4145A", group: "musique" },
  { id: "booking",       label: "Booking",         icon: "🎤", color: "#C0392B", group: "musique" },

  // Création Visuelle
  { id: "photo",         label: "Photographe",     icon: "📸", color: "#1A5276", group: "creation" },
  { id: "video",         label: "Cameraman",       icon: "🎬", color: "#154360", group: "creation" },
  { id: "montage",       label: "Montage / Motion",icon: "✂️", color: "#6C3483", group: "creation" },
  { id: "graphisme",     label: "Graphisme / DA",  icon: "🎨", color: "#117A65", group: "creation" },
  { id: "drone",         label: "Drone",           icon: "🚁", color: "#2E86C1", group: "creation" },
  { id: "modele",        label: "Modèle",          icon: "🧍", color: "#B76E79", group: "creation" },
  { id: "studio_photo",  label: "Studio photo",    icon: "🏠", color: "#1F618D", group: "creation" },
  { id: "figurant",      label: "Figurant Film/Série", icon: "🎬", color: "#E53935", group: "creation" },
  { id: "mannequin",     label: "Mannequin",       icon: "👗", color: "#D81B60", group: "creation" },
  { id: "traiteur",      label: "Traiteur",        icon: "🍱", color: "#F57C00", group: "food" },

  // Cours & Tech
  { id: "cours",         label: "Cours / Tutorat", icon: "🎓", color: "#5B2C6F", group: "savoir" },
  { id: "tech",          label: "Tech / Dépannage",icon: "💻", color: "#2980B9", group: "savoir" },
  { id: "langues",       label: "Langues",         icon: "🗣️", color: "#8E44AD", group: "savoir" },
  { id: "social_media",  label: "Social Media",    icon: "📱", color: "#E91E63", group: "savoir" },

  // Animaux
  { id: "animaux",       label: "Animaux",         icon: "🐾", color: "#A04000", group: "animaux" },

  // Événements
  { id: "evenement",     label: "Événements",      icon: "🎉", color: "#C0392B", group: "events" },
  { id: "conciergerie",  label: "Conciergerie VIP",icon: "🎩", color: "#D4AF37", group: "events" },

  // Divers
  { id: "autre",         label: "Autre",           icon: "✨", color: "#6C3483", group: "autre" },
];

export const CATEGORY_GROUPS = [
  { id: "nuit",      label: "🌙 Nuit & Luxe" },
  { id: "mobilite",  label: "🚗 Mobilité" },
  { id: "logement",  label: "🏠 Logement" },
  { id: "food",      label: "🍽️ Food & Resto" },
  { id: "emploi",    label: "💼 Emploi" },
  { id: "maison",    label: "🔧 Maison & Services" },
  { id: "bienetre",  label: "💅 Beauté & Bien-être" },
  { id: "sport",     label: "⚽ Sports & Loisirs" },
  { id: "musique",   label: "🎵 Musique & Studio" },
  { id: "creation",  label: "🎬 Création Visuelle" },
  { id: "savoir",    label: "🎓 Cours & Tech" },
  { id: "animaux",   label: "🐾 Animaux" },
  { id: "events",    label: "🎉 Événements" },
  { id: "autre",     label: "✨ Divers" },
];
