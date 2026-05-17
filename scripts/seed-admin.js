const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config({ path: ".env.local" });

const UserSchema = new mongoose.Schema({
  email: String,
  password: String,
  name: String,
  role: String,
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB");

  const email = process.env.ADMIN_EMAIL || "grwmspace@gmail.com";
  const password = process.env.ADMIN_PASSWORD || "Password@123";

  let admin = await User.findOne({ email: email.toLowerCase() });
  if (!admin) {
    const hashedPassword = await bcrypt.hash(password, 10);
    admin = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      name: "Super Admin",
      role: "admin",
    });
    console.log("Admin user created:", email);
  } else {
    admin.role = "admin";
    if (!admin.password) {
      admin.password = await bcrypt.hash(password, 10);
    }
    await admin.save();
    console.log("Admin user already exists, ensured role is admin:", email);
  }

  process.exit(0);
}

seed().catch(console.error);
