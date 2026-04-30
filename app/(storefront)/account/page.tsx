"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Package, Heart, LogOut, IdCard, Edit3, KeyRound, Loader2 } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { useCart } from "@/contexts/CartContext";

type Tab = "overview" | "profile" | "edit" | "password" | "orders";

interface Profile { id: string; name: string; email: string; phone: string; dob: string; gender: string; }

export default function AccountPage() {
  const { user, logout, openAuthPopup } = useApp();
  const { wishlist } = useCart();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("overview");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    if (!user) { openAuthPopup(); return; }
    fetch("/api/profile", { cache: "no-store" })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => setProfile(d))
      .finally(() => setLoadingProfile(false));
    fetch("/api/orders/mine", { cache: "no-store" }).then(r => r.ok ? r.json() : []).then(setOrders).catch(() => {});
  }, [user, openAuthPopup]);

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-8 py-32 text-center">
        <User className="mx-auto mb-8 w-16 h-16 stroke-[1] text-neutral-300" />
        <h1 className="font-heading text-3xl uppercase tracking-[0.15em] mb-4">Sign In Required</h1>
        <button onClick={openAuthPopup} className="bg-black text-white px-10 py-4 text-sm uppercase tracking-[0.2em] hover:bg-neutral-800 transition">Sign In</button>
      </div>
    );
  }

  const TABS: { key: Tab; label: string; icon: any }[] = [
    { key: "overview", label: "Overview", icon: User },
    { key: "profile", label: "My Profile", icon: IdCard },
    { key: "edit", label: "Edit Info", icon: Edit3 },
    { key: "password", label: "Change Password", icon: KeyRound },
    { key: "orders", label: "Orders", icon: Package },
  ];

  return (
    <div className="mx-auto max-w-6xl px-8 py-16">
      <div className="mb-12 border-b border-neutral-200 pb-8">
        <p className="text-xs uppercase tracking-[0.3em] text-neutral-500 mb-3">My Account</p>
        <h1 className="font-heading text-4xl uppercase tracking-[0.15em]">Welcome, {user.name || user.email.split("@")[0]}</h1>
        <p className="text-sm text-neutral-500 font-light mt-1">{user.email}</p>
      </div>

      <div className="grid md:grid-cols-12 gap-10">
        <aside className="md:col-span-3 space-y-1">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-xs uppercase tracking-[0.15em] transition ${tab === t.key ? "bg-black text-white" : "hover:bg-neutral-100"}`}>
                <Icon className="w-4 h-4 stroke-[1.5]" /> {t.label}
              </button>
            );
          })}
          <Link href="/wishlist" className="w-full flex items-center gap-3 px-4 py-3 text-xs uppercase tracking-[0.15em] hover:bg-neutral-100 transition">
            <Heart className="w-4 h-4 stroke-[1.5]" /> Wishlist ({wishlist.length})
          </Link>
          <button onClick={async () => { await logout(); router.push("/"); }}
            className="w-full flex items-center gap-3 px-4 py-3 text-xs uppercase tracking-[0.15em] text-[#8C001A] hover:bg-red-50 transition">
            <LogOut className="w-4 h-4 stroke-[1.5]" /> Sign Out
          </button>
        </aside>

        <section className="md:col-span-9">
          {loadingProfile && tab !== "overview" ? (
            <div className="py-20 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>
          ) : (
            <>
              {tab === "overview" && <Overview profile={profile} ordersCount={orders.length} wishlistCount={wishlist.length} />}
              {tab === "profile" && <ProfileView profile={profile} />}
              {tab === "edit" && <EditInfo profile={profile} onSave={(p) => setProfile(p)} />}
              {tab === "password" && <ChangePassword />}
              {tab === "orders" && <Orders orders={orders} />}
            </>
          )}
        </section>
      </div>
    </div>
  );
}

function Overview({ profile, ordersCount, wishlistCount }: { profile: Profile | null; ordersCount: number; wishlistCount: number; }) {
  return (
    <div>
      <h2 className="font-heading text-2xl uppercase tracking-[0.15em] mb-6">Overview</h2>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="border border-neutral-200 p-6 bg-white">
          <Package className="w-7 h-7 stroke-[1.5] mb-3" />
          <p className="text-2xl">{ordersCount}</p>
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-500 mt-1">Orders</p>
        </div>
        <div className="border border-neutral-200 p-6 bg-white">
          <Heart className="w-7 h-7 stroke-[1.5] mb-3" />
          <p className="text-2xl">{wishlistCount}</p>
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-500 mt-1">Wishlist</p>
        </div>
        <div className="border border-neutral-200 p-6 bg-white">
          <IdCard className="w-7 h-7 stroke-[1.5] mb-3" />
          <p className="text-sm">{profile?.name || "—"}</p>
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-500 mt-1">Profile</p>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-3 border-b border-neutral-100 last:border-b-0">
      <span className="text-xs uppercase tracking-[0.2em] text-neutral-500">{label}</span>
      <span className="text-sm">{value || "—"}</span>
    </div>
  );
}

function fmtDob(s: string) {
  if (!s) return "";
  // s might be YYYY-MM-DD
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (m) return `${m[3]}/${m[2]}/${m[1]}`;
  return s;
}

const GENDER_LABEL: Record<string, string> = { male: "Male", female: "Female", rather_not_say: "Rather not say" };

function ProfileView({ profile }: { profile: Profile | null }) {
  if (!profile) return null;
  return (
    <div>
      <h2 className="font-heading text-2xl uppercase tracking-[0.15em] mb-6">My Profile</h2>
      <div className="border border-neutral-200 bg-white p-8 max-w-xl">
        <Row label="Name" value={profile.name} />
        <Row label="Email" value={profile.email} />
        <Row label="Contact Number" value={profile.phone} />
        <Row label="Date of Birth" value={fmtDob(profile.dob)} />
        <Row label="Gender" value={GENDER_LABEL[profile.gender] || ""} />
      </div>
    </div>
  );
}

function EditInfo({ profile, onSave }: { profile: Profile | null; onSave: (p: Profile) => void; }) {
  const [form, setForm] = useState<any>({ name: "", phone: "", dob: "", gender: "" });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    if (profile) setForm({ name: profile.name, phone: profile.phone, dob: profile.dob, gender: profile.gender });
  }, [profile]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setMsg(null);
    try {
      const r = await fetch("/api/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await r.json();
      if (!r.ok) { setMsg({ ok: false, text: data.error || "Failed" }); return; }
      onSave(data);
      setMsg({ ok: true, text: "Profile updated" });
    } finally { setSaving(false); }
  }

  const lc = "block text-xs uppercase tracking-[0.2em] text-neutral-500 mb-2";
  const ic = "w-full border border-neutral-200 px-4 py-3 text-sm font-light outline-none focus:border-black bg-transparent";

  return (
    <div>
      <h2 className="font-heading text-2xl uppercase tracking-[0.15em] mb-6">Edit Info</h2>
      <form onSubmit={save} className="border border-neutral-200 bg-white p-8 max-w-xl space-y-5">
        <div><label className={lc}>Name</label><input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={ic} /></div>
        <div><label className={lc}>Email (cannot be changed)</label><input type="email" value={profile?.email || ""} readOnly className={`${ic} bg-neutral-50 text-neutral-500`} /></div>
        <div><label className={lc}>Contact Number</label><input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={ic} /></div>
        <div><label className={lc}>Date of Birth (DD/MM/YYYY)</label><input type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} className={ic} /></div>
        <div>
          <label className={lc}>Gender</label>
          <div className="flex gap-2">
            {[
              { v: "male", l: "Male" },
              { v: "female", l: "Female" },
              { v: "rather_not_say", l: "Rather not say" },
            ].map((g) => (
              <button key={g.v} type="button" onClick={() => setForm({ ...form, gender: g.v })}
                className={`flex-1 py-3 text-xs uppercase tracking-[0.15em] border ${form.gender === g.v ? "bg-black text-white border-black" : "border-neutral-200 hover:border-black"} transition`}>
                {g.l}
              </button>
            ))}
          </div>
        </div>
        {msg && <p className={`text-xs uppercase tracking-[0.15em] ${msg.ok ? "text-green-700" : "text-[#8C001A]"}`}>{msg.text}</p>}
        <button type="submit" disabled={saving} className="w-full bg-black text-white py-3 text-xs uppercase tracking-[0.2em] hover:bg-neutral-800 transition disabled:opacity-50">
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}

function ChangePassword() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setMsg(null);
    try {
      const r = await fetch("/api/profile/password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ current, next, confirm }) });
      const data = await r.json();
      if (!r.ok) { setMsg({ ok: false, text: data.error || "Failed" }); return; }
      setMsg({ ok: true, text: "Password updated" });
      setCurrent(""); setNext(""); setConfirm("");
    } finally { setSaving(false); }
  }

  const lc = "block text-xs uppercase tracking-[0.2em] text-neutral-500 mb-2";
  const ic = "w-full border border-neutral-200 px-4 py-3 text-sm font-light outline-none focus:border-black bg-transparent";

  return (
    <div>
      <h2 className="font-heading text-2xl uppercase tracking-[0.15em] mb-6">Change Password</h2>
      <form onSubmit={submit} className="border border-neutral-200 bg-white p-8 max-w-xl space-y-5">
        <div><label className={lc}>Current Password</label><input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} required className={ic} /></div>
        <div><label className={lc}>New Password</label><input type="password" value={next} onChange={(e) => setNext(e.target.value)} required minLength={6} className={ic} /></div>
        <div><label className={lc}>Confirm New Password</label><input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required className={ic} /></div>
        {msg && <p className={`text-xs uppercase tracking-[0.15em] ${msg.ok ? "text-green-700" : "text-[#8C001A]"}`}>{msg.text}</p>}
        <button type="submit" disabled={saving} className="w-full bg-black text-white py-3 text-xs uppercase tracking-[0.2em] hover:bg-neutral-800 transition disabled:opacity-50">
          {saving ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}

function Orders({ orders }: { orders: any[] }) {
  return (
    <div>
      <h2 className="font-heading text-2xl uppercase tracking-[0.15em] mb-6">My Orders</h2>
      {orders.length === 0 ? (
        <p className="text-sm text-neutral-500 font-light py-8 border-t border-neutral-200">No orders yet. <Link href="/collections" className="underline">Discover collections</Link></p>
      ) : (
        <div className="space-y-3">
          {orders.map((o: any) => {
            const isPending = o.status === "pending" || o.status === "processing";
            const isDelivered = o.status === "delivered";
            return (
              <div key={o._id} className="border border-neutral-200 bg-white p-5 flex justify-between items-center">
                <div>
                  <p className="font-mono text-xs">#{o._id.slice(-8).toUpperCase()}</p>
                  <p className="text-sm mt-1">{o.items?.length || 0} items · ₹{o.total?.toLocaleString("en-IN")}</p>
                  <div className="mt-3 flex gap-3">
                    {isPending && (
                      <Link href={`/account/requests?orderId=${o._id}&type=cancel`} className="text-[10px] uppercase tracking-[0.2em] border border-[#8C001A] text-[#8C001A] px-3 py-1 hover:bg-[#8C001A] hover:text-white transition">Cancel Order</Link>
                    )}
                    {isDelivered && (
                      <Link href={`/account/requests?orderId=${o._id}&type=return`} className="text-[10px] uppercase tracking-[0.2em] border border-black text-black px-3 py-1 hover:bg-black hover:text-white transition">Return Order</Link>
                    )}
                  </div>
                </div>
                <span className="text-xs uppercase tracking-[0.2em] px-3 py-1 border border-neutral-200">{o.status}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
