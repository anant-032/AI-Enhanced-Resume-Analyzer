import mongoose from "mongoose";
import bcrypt from "bcryptjs";

/* =========================
   USER SCHEMA
   ========================= */
const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false, // 🔒 never return password by default
    },

    role: {
      type: String,
      default: "user", // future-proof (admin, recruiter, etc.)
    },
  },
  { timestamps: true }
);

/* =========================
   PASSWORD HASHING
   ========================= */
UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});


/* =========================
   PASSWORD COMPARE METHOD
   ========================= */
UserSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", UserSchema);
