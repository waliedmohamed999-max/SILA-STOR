const names = [
  "Maya Chen", "Omar Khalid", "Lina Santos", "Noah Brooks", "Ava Morgan", "Yousef Nasser", "Sofia Rossi", "Ethan Clark", "Nora Haddad", "Leo Bennett",
  "Amal Hassan", "Mila Evans", "Adam Reed", "Zara Ali", "Ivy Carter", "Ryan Stone", "Hana Park", "Theo Gray", "Layla Mansour", "Eli Cooper",
  "Sara Novak", "Jonah Price", "Mira Khan", "Aria Blake", "Samir Saleh", "Nina Ford", "Kai Turner", "Leen Faris", "Jude Wilson", "Raya Kim",
];

export const customers = names.map((name, index) => ({
  id: index + 1,
  name,
  email: `${name.toLowerCase().replace(" ", ".")}@commerce.example`,
  totalSpent: 640 + ((index * 421) % 9200),
  orders: 2 + ((index * 3) % 24),
  tier: ["Platinum", "Gold", "Silver", "Bronze"][index % 4],
  favoriteCategory: ["Laptops", "Phones", "Headphones", "Cameras", "Tablets", "Accessories"][(index * 2) % 6],
  city: ["نيويورك", "الرياض", "لندن", "دبي", "برلين", "تورونتو"][index % 6],
  phone: `+1 555 ${1200 + index * 37}`,
}));
