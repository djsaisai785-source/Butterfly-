export const CATEGORIES = [
  { id: "nightlife", label: "Nightlife", icon: "🎵", color: "#9B5DE5", items: ["Discothèque", "Club", "Bar lounge", "Rooftop", "Soirée privée", "Casino"] },
  { id: "emploi", label: "Emploi nuit", icon: "💼", color: "#7B2FBE", items: ["Barman", "Serveur", "DJ", "Videur", "Hôtesse", "Croupier", "Cuisinier"] },
  { id: "vip", label: "VIP / Privé", icon: "💎", color: "#F72585", items: ["Table VIP", "Soirée villa", "Bodyguard", "Conciergerie", "Photographe privé"] },
  { id: "entertainment", label: "Entertainment", icon: "🎭", color: "#00F5FF", items: ["DJ", "Musicien live", "Magicien", "Animateur", "Danseur", "Humoriste"] },
  { id: "location", label: "Location", icon: "🔑", color: "#C77DFF", items: ["Ferrari", "Lamborghini", "Yacht", "Villa", "Moto", "Bus privatisé", "Jet privé"] },
  { id: "transport", label: "Transport", icon: "🚗", color: "#5E60CE", items: ["VTC nuit", "Limousine", "Navette club", "Bateau-taxi"] },
  { id: "restauration", label: "Restauration", icon: "🍽️", color: "#FF6B6B", items: ["Chef privé", "Traiteur", "Bar", "Food truck", "After party"] },
  { id: "hebergement", label: "Hébergement", icon: "🏨", color: "#48CAE4", items: ["Hôtel", "Villa", "Yacht", "Airbnb", "Suite"] },
];

export const getCategoryColor = (id: string) => CATEGORIES.find(c => c.id === id)?.color || "#9B5DE5";
export const getCategoryLabel = (id: string) => CATEGORIES.find(c => c.id === id)?.label || id;
export const getCategoryIcon = (id: string) => CATEGORIES.find(c => c.id === id)?.icon || "🌙";
