// mongo-init.js — runs once on first container start
try {
  rs.initiate({
    _id: "rs0",
    members: [{ _id: 0, host: "localhost:27017" }],
  });
  print("✅ Replica set initiated");
} catch (e) {
  // Already initiated on subsequent starts — safe to ignore
  print("ℹ️  Replica set already initiated: " + e.message);
}