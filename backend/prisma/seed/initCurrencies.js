const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// Starting set: currencies confirmed for Flutterwave's local-currency
// processing corridor across African markets, plus USD as the common
// cross-border settlement currency. This is intentionally conservative —
// only add a currency here once you've confirmed directly with
// Flutterwave that it's supported for your use case (collection,
// settlement, and — if using it — escrow), since their supported list
// changes over time and getting this wrong has real financial impact.
//
// To add a currency later: just insert a new row (via this script or the
// admin panel) — no migration needed, that's the whole point of this
// being a table instead of an enum.
const defaultCurrencies = [
  { code: "NGN", name: "Nigerian Naira", symbol: "₦" },
  { code: "GHS", name: "Ghanaian Cedi", symbol: "GH₵" },
  { code: "KES", name: "Kenyan Shilling", symbol: "KSh" },
  { code: "ZAR", name: "South African Rand", symbol: "R" },
  { code: "UGX", name: "Ugandan Shilling", symbol: "USh" },
  { code: "TZS", name: "Tanzanian Shilling", symbol: "TSh" },
  { code: "USD", name: "US Dollar", symbol: "$" },
];

async function seedCurrencies() {
  try {
    for (const currency of defaultCurrencies) {
      const result = await prisma.currencies.upsert({
        where: { code: currency.code },
        update: {
          name: currency.name,
          symbol: currency.symbol,
        },
        create: {
          ...currency,
          isActive: true,
        },
      });

      console.log(`✅ '${result.code}' (${result.name}) upserted.`);
    }

    console.log("\n🎉 Currency seeding completed!");
    console.log(
      "ℹ️  Reminder: verify each currency against Flutterwave's current " +
        "supported list before enabling it for real transactions.",
    );
  } catch (error) {
    console.error("❌ Failed to seed currencies:", error);
  } finally {
    await prisma.$disconnect();
  }
}

module.exports = { seedCurrencies };
