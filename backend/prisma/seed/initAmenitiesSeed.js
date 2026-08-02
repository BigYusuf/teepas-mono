const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const defaultAmenities = [
  // Community Amenities
  { name: "Controlled Access", category: "Community Amenities" },
  { name: "Clubhouse", category: "Community Amenities" },
  { name: "Lounge", category: "Community Amenities" },
  { name: "Concierge Service", category: "Community Amenities" },
  { name: "Reception", category: "Community Amenities" },
  { name: "Visitor Parking", category: "Community Amenities" },

  // Outdoor Space
  { name: "Picnic Area", category: "Outdoor Space" },
  { name: "Gated Entrance", category: "Outdoor Space" },
  { name: "Grill / BBQ Area", category: "Outdoor Space" },
  { name: "Garden", category: "Outdoor Space" },
  { name: "Rooftop Terrace", category: "Outdoor Space" },
  { name: "Children's Playground", category: "Outdoor Space" },

  // Fitness & Recreation
  { name: "Fitness Center", category: "Fitness & Recreation" },
  { name: "Swimming Pool", category: "Fitness & Recreation" },
  { name: "Spa", category: "Fitness & Recreation" },
  { name: "Sauna", category: "Fitness & Recreation" },
  { name: "Walking / Biking Trails", category: "Fitness & Recreation" },
  { name: "Sports Court", category: "Fitness & Recreation" },

  // Apartment Features
  { name: "Dishwasher", category: "Apartment Features" },
  { name: "Microwave", category: "Apartment Features" },
  { name: "Kitchen", category: "Apartment Features" },
  { name: "Refrigerator", category: "Apartment Features" },
  { name: "Bay Window", category: "Apartment Features" },
  { name: "Walk-In Closet", category: "Apartment Features" },
  { name: "Balcony", category: "Apartment Features" },
  { name: "Patio", category: "Apartment Features" },
  { name: "Private Terrace", category: "Apartment Features" },
  { name: "En-Suite Bathroom", category: "Apartment Features" },
  { name: "Study / Home Office", category: "Apartment Features" },

  // Utilities & Infrastructure
  { name: "24/7 Power Supply", category: "Utilities & Infrastructure" },
  { name: "Backup Generator", category: "Utilities & Infrastructure" },
  { name: "Solar Panels", category: "Utilities & Infrastructure" },
  { name: "Borehole / Water Supply", category: "Utilities & Infrastructure" },
  { name: "High-Speed Internet", category: "Utilities & Infrastructure" },
  { name: "Cable TV Ready", category: "Utilities & Infrastructure" },

  // Security
  { name: "24/7 Security", category: "Security" },
  { name: "CCTV Surveillance", category: "Security" },
  { name: "Security Guard", category: "Security" },
  { name: "Intercom System", category: "Security" },
  { name: "Smart Lock", category: "Security" },

  // Parking & Transport
  { name: "Covered Parking", category: "Parking & Transport" },
  { name: "Garage", category: "Parking & Transport" },
  { name: "EV Charging Station", category: "Parking & Transport" },
  { name: "Bicycle Storage", category: "Parking & Transport" },

  // Accessibility
  { name: "Elevator / Lift", category: "Accessibility" },
  { name: "Wheelchair Accessible", category: "Accessibility" },
  { name: "Ground Floor Unit", category: "Accessibility" },

  // Pet & Lifestyle
  { name: "Pet Friendly", category: "Pet & Lifestyle" },
  { name: "Laundry Room", category: "Pet & Lifestyle" },
  { name: "Washing Machine", category: "Pet & Lifestyle" },
  { name: "Storage Room", category: "Pet & Lifestyle" },
  { name: "Serviced / Cleaning Included", category: "Pet & Lifestyle" },
];

const seedAmenities = async () => {
  try {
    for (const amenity of defaultAmenities) {
      const exists = await prisma.amenities.findUnique({
        where: { name: amenity.name },
      });

      if (!exists) {
        await prisma.amenities.create({ data: amenity });
        console.log(`✅ Amenity '${amenity.name}' created.`);
      } else {
        console.log(`ℹ️  Amenity '${amenity.name}' already exists, skipping.`);
      }
    }

    console.log("\n🎉 Amenities seeding completed!");
  } catch (error) {
    console.error("❌ Failed to seed amenities:", error);
  } finally {
    await prisma.$disconnect();
  }
};

module.exports = { seedAmenities };
