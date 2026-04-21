export const revenueData = ["May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr"].map((month, index) => ({
  month,
  revenue: [82000, 91000, 96000, 103000, 118000, 126000, 142000, 168000, 151000, 173000, 191000, 214000][index],
  orders: [980, 1080, 1125, 1190, 1310, 1390, 1510, 1804, 1602, 1840, 2018, 2240][index],
}));

export const categorySales = [
  { day: "Mon", Laptops: 42, Phones: 54, Audio: 33, Cameras: 21 },
  { day: "Tue", Laptops: 36, Phones: 61, Audio: 44, Cameras: 25 },
  { day: "Wed", Laptops: 52, Phones: 70, Audio: 39, Cameras: 30 },
  { day: "Thu", Laptops: 47, Phones: 64, Audio: 48, Cameras: 27 },
  { day: "Fri", Laptops: 63, Phones: 84, Audio: 57, Cameras: 36 },
  { day: "Sat", Laptops: 71, Phones: 92, Audio: 62, Cameras: 43 },
  { day: "Sun", Laptops: 58, Phones: 76, Audio: 51, Cameras: 34 },
];

export const trafficSources = [
  { name: "Organic", value: 42 },
  { name: "Paid Search", value: 24 },
  { name: "Social", value: 18 },
  { name: "Email", value: 10 },
  { name: "Referral", value: 6 },
];
