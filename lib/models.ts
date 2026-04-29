import mongoose, { Schema, models, model } from "mongoose";

const UserSchema = new Schema(
  {
    name: String,
    email: { type: String, unique: true, required: true },
    password: String,
    role: { type: String, enum: ["user", "admin"], default: "user" },
    phone: String,
    dob: String,
    gender: { type: String, enum: ["male", "female", "rather_not_say", ""] },
    blocked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const ProductSchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    price: { type: Number, required: true },
    salePrice: Number,
    image: String,
    gallery: [String],
    category: String,
    collectionSlug: String,
    fabricType: String,
    careInstructions: String,
    sku: String,
    sizes: [String],
    tags: [{ type: String, enum: ["NEW", "BESTSELLER", "SALE"] }],
    stock: { type: Number, default: 10 },
    inStock: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
    bestseller: { type: Boolean, default: false },
    newArrival: { type: Boolean, default: false },
    onSale: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const CollectionSchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    image: String,
    showOnHome: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    productIds: [String],
  },
  { timestamps: true }
);

const OrderSchema = new Schema(
  {
    userId: String,
    customer: { name: String, email: String, phone: String },
    items: [
      { productId: String, name: String, price: Number, size: String, quantity: Number, image: String },
    ],
    address: { line1: String, city: String, state: String, pincode: String },
    subtotal: Number,
    discount: Number,
    couponCode: String,
    total: Number,
    paymentMethod: { type: String, enum: ["razorpay", "cod"], default: "razorpay" },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "out_for_delivery", "delivered", "cancelled"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "done", "failed", "refunded"],
      default: "pending",
    },
    razorpayOrderId: String,
    razorpayPaymentId: String,
  },
  { timestamps: true }
);

const CouponSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    type: { type: String, enum: ["flat", "percent"], default: "percent" },
    value: { type: Number, required: true },
    minOrder: { type: Number, default: 0 },
    startsAt: Date,
    expiry: Date,
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const OfferSchema = new Schema(
  {
    title: String,
    description: String,
    image: String,
    linkType: { type: String, enum: ["product", "collection", "url"], default: "collection" },
    linkValue: String,
    showOnBar: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
    startsAt: Date,
    endsAt: Date,
  },
  { timestamps: true }
);

const SettingsSchema = new Schema(
  { key: { type: String, unique: true, required: true }, value: Schema.Types.Mixed },
  { timestamps: true }
);

const BannerSchema = new Schema(
  {
    title: String,
    subtitle: String,
    image: String,
    link: String,
    active: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const FooterPageSchema = new Schema(
  {
    slug: { type: String, unique: true, required: true },
    title: String,
    content: String,
    showInFooter: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const InquirySchema = new Schema(
  {
    type: { type: String, enum: ["custom_fit", "general"], default: "custom_fit" },
    name: String,
    email: String,
    phone: String,
    productId: String,
    productName: String,
    note: String,
    status: { type: String, enum: ["new", "contacted", "resolved"], default: "new" },
  },
  { timestamps: true }
);

const NavLinkSchema = new Schema(
  {
    label: { type: String, required: true },
    href: { type: String, default: "#" },
    parentId: String,
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const User = models.User || model("User", UserSchema);
export const Product = models.Product || model("Product", ProductSchema);
export const CollectionModel = models.Collection || model("Collection", CollectionSchema);
export const Order = models.Order || model("Order", OrderSchema);
export const Coupon = models.Coupon || model("Coupon", CouponSchema);
export const Offer = models.Offer || model("Offer", OfferSchema);
export const Settings = models.Settings || model("Settings", SettingsSchema);
export const Banner = models.Banner || model("Banner", BannerSchema);
export const FooterPage = models.FooterPage || model("FooterPage", FooterPageSchema);
export const Inquiry = models.Inquiry || model("Inquiry", InquirySchema);
export const NavLink = models.NavLink || model("NavLink", NavLinkSchema);

export type ProductDoc = mongoose.InferSchemaType<typeof ProductSchema> & { _id: string };
export type OrderDoc = mongoose.InferSchemaType<typeof OrderSchema> & { _id: string };
