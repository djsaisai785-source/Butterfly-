import { Hono } from "hono";
import { cors } from "hono/cors";
import { db } from "./database";
import * as schema from "./database/schema";
import { eq, desc, and, or, like, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { auth } from "./auth";
import Stripe from "stripe";
import { Autumn } from "autumn-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "sk_test_placeholder");
const autumnSdk = new Autumn();

// ─── Auth handler (must be before basePath) ───
const authApp = new Hono();
authApp.use(
  "/api/auth/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "OPTIONS"],
    exposeHeaders: ["Set-Cookie", "set-auth-token"],
    credentials: true,
  }),
);
authApp.on(["GET", "POST"], "/api/auth/*", (c) => auth.handler(c.req.raw));

const app = new Hono()
  .basePath("api")
  .use(cors({ origin: "*", allowHeaders: ["Content-Type", "Authorization"], exposeHeaders: ["set-auth-token"] }))

  // Health
  .get("/health", (c) => c.json({ status: "ok" }, 200))

  // ─── USERS ───
  .get("/users/:id", async (c) => {
    const { id } = c.req.param();
    const [user] = await db.select().from(schema.users).where(eq(schema.users.id, id));
    if (!user) return c.json({ error: "Not found" }, 404);
    return c.json({ user }, 200);
  })
  .post("/users", async (c) => {
    const body = await c.req.json();
    const [user] = await db.insert(schema.users).values({
      id: nanoid(),
      ...body,
    }).returning();
    return c.json({ user }, 201);
  })
  .put("/users/:id", async (c) => {
    const { id } = c.req.param();
    const body = await c.req.json();
    const [user] = await db.update(schema.users).set(body).where(eq(schema.users.id, id)).returning();
    return c.json({ user }, 200);
  })

  // ─── LISTINGS ───
  .get("/listings", async (c) => {
    const { category, type, location, q } = c.req.query();
    let query = db.select({
      listing: schema.listings,
      user: {
        id: schema.users.id,
        name: schema.users.name,
        avatar: schema.users.avatar,
        verified: schema.users.verified,
        rating: schema.users.rating,
      }
    })
    .from(schema.listings)
    .leftJoin(schema.users, eq(schema.listings.userId, schema.users.id))
    .where(eq(schema.listings.status, "active"))
    .orderBy(desc(schema.listings.createdAt))
    .limit(50);

    const listings = await query;
    return c.json({ listings }, 200);
  })
  .get("/listings/:id", async (c) => {
    const { id } = c.req.param();
    const [row] = await db.select({
      listing: schema.listings,
      user: {
        id: schema.users.id,
        name: schema.users.name,
        avatar: schema.users.avatar,
        verified: schema.users.verified,
        rating: schema.users.rating,
        reviewCount: schema.users.reviewCount,
        bio: schema.users.bio,
        location: schema.users.location,
      }
    })
    .from(schema.listings)
    .leftJoin(schema.users, eq(schema.listings.userId, schema.users.id))
    .where(eq(schema.listings.id, id));
    if (!row) return c.json({ error: "Not found" }, 404);
    // increment views
    await db.update(schema.listings).set({ viewCount: sql`${schema.listings.viewCount} + 1` }).where(eq(schema.listings.id, id));
    return c.json(row, 200);
  })
  .post("/listings", async (c) => {
    try {
      const session = await auth.api.getSession({ headers: c.req.raw.headers });
      if (!session) return c.json({ error: "Unauthorized" }, 401);
      const body = await c.req.json();
      const userId = body.userId || session.user.id;
      const [listing] = await db.insert(schema.listings).values({
        id: nanoid(),
        ...body,
        userId,
      }).returning();
      return c.json({ listing }, 201);
    } catch (e: any) {
      console.error("[listings POST]", e?.message);
      return c.json({ error: e?.message ?? "Internal error" }, 500);
    }
  })
  .put("/listings/:id", async (c) => {
    const { id } = c.req.param();
    const body = await c.req.json();
    const [listing] = await db.update(schema.listings).set({ ...body, updatedAt: new Date() }).where(eq(schema.listings.id, id)).returning();
    return c.json({ listing }, 200);
  })
  .delete("/listings/:id", async (c) => {
    const { id } = c.req.param();
    await db.delete(schema.listings).where(eq(schema.listings.id, id));
    return c.json({ success: true }, 200);
  })

  // ─── RESERVATIONS ───
  .get("/reservations", async (c) => {
    const { userId } = c.req.query();
    const buyer = schema.users as typeof schema.users;
    const seller = schema.users as typeof schema.users;
    const rows = await db.select().from(schema.reservations)
      .where(userId ? or(eq(schema.reservations.buyerId, userId), eq(schema.reservations.sellerId, userId)) : undefined)
      .orderBy(desc(schema.reservations.createdAt));
    // Enrich with listing + user data
    const enriched = await Promise.all(rows.map(async (r) => {
      const [listing] = await db.select().from(schema.listings).where(eq(schema.listings.id, r.listingId));
      const [buyerUser] = await db.select({ id: schema.users.id, name: schema.users.name, email: schema.users.email }).from(schema.users).where(eq(schema.users.id, r.buyerId));
      const [sellerUser] = await db.select({ id: schema.users.id, name: schema.users.name, email: schema.users.email }).from(schema.users).where(eq(schema.users.id, r.sellerId));
      return { ...r, listing: listing ?? null, buyer: buyerUser ?? null, seller: sellerUser ?? null };
    }));
    return c.json({ reservations: enriched }, 200);
  })
  .post("/reservations", async (c) => {
    try {
      const session = await auth.api.getSession({ headers: c.req.raw.headers });
      if (!session) return c.json({ error: "Unauthorized" }, 401);
      const body = await c.req.json();
      const buyerId = body.buyerId || session.user.id;
      // Auto-resolve sellerId from listing if not provided
      let sellerId = body.sellerId;
      if (!sellerId && body.listingId) {
        const [listing] = await db.select({ userId: schema.listings.userId })
          .from(schema.listings)
          .where(eq(schema.listings.id, body.listingId));
        sellerId = listing?.userId ?? null;
      }
      const [reservation] = await db.insert(schema.reservations).values({
        id: nanoid(),
        ...body,
        buyerId,
        sellerId,
        price: body.price ?? body.totalPrice ?? 0,
      }).returning();
      return c.json({ reservation }, 201);
    } catch (e: any) {
      console.error("[reservations POST]", e?.message);
      return c.json({ error: e?.message ?? "Internal error" }, 500);
    }
  })
  .put("/reservations/:id", async (c) => {
    const { id } = c.req.param();
    const body = await c.req.json();
    const [reservation] = await db.update(schema.reservations).set(body).where(eq(schema.reservations.id, id)).returning();
    return c.json({ reservation }, 200);
  })
  .patch("/reservations/:id", async (c) => {
    const { id } = c.req.param();
    const body = await c.req.json();
    const [reservation] = await db.update(schema.reservations).set(body).where(eq(schema.reservations.id, id)).returning();
    return c.json({ reservation }, 200);
  })

  // ─── MESSAGES ───
  .get("/conversations", async (c) => {
    const { userId } = c.req.query();
    if (!userId) return c.json({ conversations: [] }, 200);
    const convos = await db.select().from(schema.conversations)
      .where(or(eq(schema.conversations.participant1Id, userId), eq(schema.conversations.participant2Id, userId)))
      .orderBy(desc(schema.conversations.lastMessageAt));
    // Enrich with participants + listing
    const enriched = await Promise.all(convos.map(async (c) => {
      const [p1] = await db.select({ id: schema.users.id, name: schema.users.name, email: schema.users.email }).from(schema.users).where(eq(schema.users.id, c.participant1Id));
      const [p2] = await db.select({ id: schema.users.id, name: schema.users.name, email: schema.users.email }).from(schema.users).where(eq(schema.users.id, c.participant2Id));
      const listing = c.listingId ? (await db.select({ id: schema.listings.id, title: schema.listings.title }).from(schema.listings).where(eq(schema.listings.id, c.listingId)))[0] ?? null : null;
      return { ...c, participant1: p1 ?? null, participant2: p2 ?? null, listing: listing ?? null };
    }));
    return c.json({ conversations: enriched }, 200);
  })
  .post("/conversations", async (c) => {
    try {
      const session = await auth.api.getSession({ headers: c.req.raw.headers });
      if (!session) return c.json({ error: "Unauthorized" }, 401);
      const body = await c.req.json();
      // participant1 = current user, participant2 = other user
      const participant1Id = body.participant1Id || session.user.id;
      const [convo] = await db.insert(schema.conversations).values({
        id: nanoid(),
        ...body,
        participant1Id,
      }).returning();
      return c.json({ conversation: convo }, 201);
    } catch (e: any) {
      console.error("[conversations POST]", e?.message);
      return c.json({ error: e?.message ?? "Internal error" }, 500);
    }
  })
  .get("/conversations/:id/messages", async (c) => {
    const { id } = c.req.param();
    const msgs = await db.select().from(schema.messages)
      .where(eq(schema.messages.conversationId, id))
      .orderBy(schema.messages.createdAt);
    return c.json({ messages: msgs }, 200);
  })
  .post("/conversations/:id/messages", async (c) => {
    try {
      const session = await auth.api.getSession({ headers: c.req.raw.headers });
      if (!session) return c.json({ error: "Unauthorized" }, 401);
      const { id } = c.req.param();
      const body = await c.req.json();
      const senderId = body.senderId || session.user.id;
      const [msg] = await db.insert(schema.messages).values({
        id: nanoid(),
        conversationId: id,
        ...body,
        senderId,
      }).returning();
      // update last message
      await db.update(schema.conversations).set({
        lastMessage: body.content,
        lastMessageAt: new Date(),
      }).where(eq(schema.conversations.id, id));
      return c.json({ message: msg }, 201);
    } catch (e: any) {
      console.error("[messages POST]", e?.message);
      return c.json({ error: e?.message ?? "Internal error" }, 500);
    }
  })

  // ─── REVIEWS ───
  .get("/reviews", async (c) => {
    const { userId } = c.req.query();
    const revs = await db.select().from(schema.reviews)
      .where(userId ? eq(schema.reviews.reviewedId, userId) : undefined)
      .orderBy(desc(schema.reviews.createdAt));
    return c.json({ reviews: revs }, 200);
  })
  .post("/reviews", async (c) => {
    const body = await c.req.json();
    const [review] = await db.insert(schema.reviews).values({
      id: nanoid(),
      ...body,
    }).returning();
    return c.json({ review }, 201);
  })

  // ─── SEED (dev only) ───
  .post("/seed", async (c) => {
    const seedUsers = [
      // ── AURA / Nightlife ──
      { id: "u1", name: "Marco Rossi", email: "marco@aura.app", type: "pro", location: "Paris", verified: true, rating: 4.8, reviewCount: 42, bio: "DJ professionnel depuis 15 ans. House, deep, afro.", categories: JSON.stringify(["nightlife"]) },
      { id: "u2", name: "Sophie Laurent", email: "sophie@aura.app", type: "pro", location: "Nice", verified: true, rating: 4.9, reviewCount: 87, bio: "Chef étoilée & traiteur événementiel haut de gamme", categories: JSON.stringify(["restauration"]) },
      { id: "u3", name: "Karim Diallo", email: "karim@aura.app", type: "user", location: "Cannes", verified: true, rating: 4.5, reviewCount: 12, bio: "Chauffeur VTC premium, disponible 24h/24", categories: JSON.stringify(["transport"]) },
      { id: "u4", name: "Lucie Moreau", email: "lucie@aura.app", type: "vip", location: "Paris", verified: true, rating: 5.0, reviewCount: 34, bio: "Directrice artistique & event planner", categories: JSON.stringify(["nightlife", "emploi"]) },
      { id: "u5", name: "Alexandre Petit", email: "alex@aura.app", type: "pro", location: "Lyon", verified: false, rating: 4.2, reviewCount: 8, bio: "Barman & mixologue spécialisé cocktails premium", categories: JSON.stringify(["emploi", "restauration"]) },
      { id: "u6", name: "Camille Dubois", email: "camille@aura.app", type: "user", location: "Marseille", verified: false, rating: 0, reviewCount: 0, bio: "Passionnée de gastronomie et de nuits parisiennes", categories: JSON.stringify(["dating", "restauration"]) },
      // ── KIDO / Famille ──
      { id: "k1", name: "Isabelle Fontaine", email: "isabelle@aura.app", type: "pro", location: "Lyon", verified: true, rating: 4.9, reviewCount: 61, bio: "Guide rando famille, passionnée de plein air et nature", categories: JSON.stringify(["famille", "rando"]) },
      { id: "k2", name: "Arnaud Lemaire", email: "arnaud@aura.app", type: "pro", location: "Nice", verified: true, rating: 4.8, reviewCount: 54, bio: "Animateur jeunesse & ateliers créatifs depuis 12 ans", categories: JSON.stringify(["famille", "atelier"]) },
      { id: "k3", name: "Nadia Bensaid", email: "nadia@aura.app", type: "vip", location: "Paris", verified: true, rating: 5.0, reviewCount: 29, bio: "Nounou diplômée, 10 ans d'expérience, premiers secours certifiée", categories: JSON.stringify(["famille", "nounou"]) },
      { id: "k4", name: "Pierre Gauthier", email: "pierre@aura.app", type: "pro", location: "Marseille", verified: true, rating: 4.7, reviewCount: 38, bio: "Maître-nageur & instructeur aquatique bébé-nageurs", categories: JSON.stringify(["famille", "baignade"]) },
    ];

    for (const u of seedUsers) {
      await db.insert(schema.users).values(u).onConflictDoNothing();
    }

    const seedListings = [
      // ── AURA / Nightlife ──
      { id: "l1", userId: "u1", type: "offer", category: "nightlife", title: "DJ Set Premium — Soirée Privée", description: "DJ professionnel disponible pour vos soirées privées, villas, clubs. Matériel inclus. Répertoire : house, deep, afro.", price: 800, priceUnit: "soiree", location: "Paris / Île-de-France", tags: JSON.stringify(["DJ", "soirée", "privé", "musique"]), status: "active", featured: true },
      { id: "l2", userId: "u2", type: "offer", category: "restauration", title: "Chef Privé à Domicile — Dîner Gastronomique", description: "Cuisine étoilée chez vous. Menu personnalisé, service complet, accord mets-vins. Jusqu'à 20 personnes.", price: 350, priceUnit: "personne", location: "Nice & Côte d'Azur", tags: JSON.stringify(["chef", "gastronomie", "dîner", "luxe"]), status: "active", featured: true },
      { id: "l3", userId: "u3", type: "offer", category: "transport", title: "Chauffeur VTC — Service Nocturne 24h/24", description: "Disponible 24h/24 7j/7. Mercedes Classe S & Tesla. Aéroports, clubs, transferts VIP.", price: 60, priceUnit: "heure", location: "Cannes, Nice, Monaco", tags: JSON.stringify(["VTC", "chauffeur", "nuit", "aéroport"]), status: "active", featured: false },
      { id: "l4", userId: "u4", type: "offer", category: "nightlife", title: "Table VIP Réservée — Club Privé Paris", description: "Accès à une table VIP dans les meilleurs clubs parisiens. Bouteilles, service dédié, liste prioritaire.", price: 500, priceUnit: "soiree", location: "Paris, 8ème", tags: JSON.stringify(["VIP", "club", "table", "soirée"]), status: "active", featured: true },
      { id: "l5", userId: "u5", type: "offer", category: "emploi", title: "Barman expérimenté — Cocktails Premium", description: "Barman & mixologue disponible pour vos événements privés, mariages, soirées d'entreprise. Matériel inclus.", price: 200, priceUnit: "soiree", location: "Lyon, Paris", tags: JSON.stringify(["barman", "cocktail", "événement", "mariage"]), status: "active", featured: false },
      { id: "l6", userId: "u3", type: "demand", category: "emploi", title: "Recherche Barman — Vendredi & Samedi soir", description: "Club privé cherche barman expérimenté cocktails pour les weekends. 150€/soir + pourboires.", price: 150, priceUnit: "soiree", location: "Paris, 8ème", tags: JSON.stringify(["barman", "cocktail", "club", "emploi nuit"]), status: "active", featured: false },
      { id: "l7", userId: "u6", type: "offer", category: "dating", title: "Dîner & Découverte — Soirée Authentique", description: "Passionnée de gastronomie et de culture, je cherche une rencontre sincère autour d'un bon repas ou d'une soirée jazz.", price: null, priceUnit: null, location: "Marseille", tags: JSON.stringify(["rencontre", "dîner", "jazz", "authentique"]), status: "active", featured: false },
      { id: "l8", userId: "u1", type: "demand", category: "transport", title: "Recherche VTC — Aéroport CDG → Paris", description: "Besoin d'un chauffeur VTC pour un transfert depuis CDG vers Paris 16ème. Samedi 22h. Véhicule premium.", price: 120, priceUnit: "prestation", location: "CDG → Paris", tags: JSON.stringify(["CDG", "aéroport", "transfert", "premium"]), status: "active", featured: false },
      // ── KIDO / Famille ──
      { id: "k1", userId: "k1", type: "offer", category: "famille", title: "Rando famille — Gorges du Verdon", description: "Balade guidée de 3h adaptée aux enfants dès 5 ans. Panoramas incroyables, pique-nique inclus. Groupe max 10 personnes.", price: 25, priceUnit: "personne", location: "Gorges du Verdon, PACA", tags: JSON.stringify(["rando", "nature", "famille", "enfants"]), status: "active", featured: true },
      { id: "k2", userId: "k2", type: "offer", category: "famille", title: "Atelier Poterie Enfants — 4 à 12 ans", description: "Initiation à la poterie en petit groupe. Chaque enfant repart avec sa création cuite et peinte. Tabliers fournis.", price: 18, priceUnit: "enfant", location: "Nice, Côte d'Azur", tags: JSON.stringify(["poterie", "atelier", "créatif"]), status: "active", featured: true },
      { id: "k3", userId: "k3", type: "offer", category: "famille", title: "Nounou diplômée — Garde à domicile", description: "Disponible soirs et weekends. Expérience avec bébés et enfants jusqu'à 6 ans. Premiers secours certifiée.", price: 14, priceUnit: "heure", location: "Paris 11ème", tags: JSON.stringify(["nounou", "garde", "bébé", "domicile"]), status: "active", featured: false },
      { id: "k4", userId: "k4", type: "offer", category: "famille", title: "Cours natation Bébé-Nageurs — 6 mois à 3 ans", description: "Séances d'aqua-éveil en piscine chauffée. Accompagné d'un parent. Inscription par trimestre.", price: 120, priceUnit: "trimestre", location: "Marseille", tags: JSON.stringify(["natation", "bébé", "aquatique"]), status: "active", featured: false },
      { id: "k5", userId: "k1", type: "offer", category: "famille", title: "Spot plage secrète — Calanques", description: "Je partage mon spot préféré dans les calanques. Eau turquoise, ombre naturelle. Accès 30min à pied.", price: null, priceUnit: null, location: "Marseille, Calanques", tags: JSON.stringify(["plage", "calanques", "gratuit"]), status: "active", featured: true },
      { id: "k6", userId: "k2", type: "offer", category: "famille", title: "Spectacle Marionnettes — dès 3 ans", description: "Représentations chaque samedi matin. 45 minutes de magie pour toute la famille.", price: 8, priceUnit: "enfant", location: "Nice, Centre-ville", tags: JSON.stringify(["marionnettes", "spectacle", "enfants"]), status: "active", featured: false },
      { id: "k7", userId: "k1", type: "demand", category: "famille", title: "Cherche nounou — 2 soirs/semaine Paris", description: "Famille avec 2 enfants (4 et 7 ans) cherche nounou de confiance pour mardis et jeudis soir à partir de 18h.", price: 13, priceUnit: "heure", location: "Paris 20ème", tags: JSON.stringify(["nounou", "garde", "soir"]), status: "active", featured: false },
    ];

    for (const l of seedListings) {
      await db.insert(schema.listings).values(l).onConflictDoNothing();
    }

    return c.json({ success: true, users: seedUsers.length, listings: seedListings.length }, 200);
  })

  // ─── MIGRATE: backfill auth users → app users table ───
  .post("/migrate-users", async (c) => {
    const authUsers = await db.select().from(schema.authUser);
    let inserted = 0;
    for (const u of authUsers) {
      await db.insert(schema.users).values({
        id: u.id,
        name: u.name,
        email: u.email,
        type: "user",
        verified: u.emailVerified ? 1 : 0,
        rating: 0,
        reviewCount: 0,
      }).onConflictDoNothing();
      inserted++;
    }
    return c.json({ success: true, authUsers: authUsers.length, inserted }, 200);
  })

  // ─── PAYMENTS — Stripe PaymentIntent (réservation) ───
  .post("/payments/create-intent", async (c) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session) return c.json({ error: "Unauthorized" }, 401);

    const { listingId, amount, currency = "eur" } = await c.req.json();
    if (!listingId || !amount) return c.json({ error: "listingId and amount required" }, 400);

    // NOTE: Uncomment to enforce Autumn plan check for booking
    // const { allowed } = await autumnSdk.check({ customerId: session.user.id, featureId: "send_message" });
    // if (!allowed) return c.json({ error: "Upgrade required to book" }, 403);

    const intent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // euros → cents
      currency,
      metadata: {
        listingId,
        buyerId: session.user.id,
      },
    });

    return c.json({ clientSecret: intent.client_secret, intentId: intent.id }, 200);
  })

  // ─── PAYMENTS — Autumn subscription check ───
  .get("/payments/status", async (c) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session) return c.json({ error: "Unauthorized" }, 401);

    try {
      const customer = await autumnSdk.customers.getOrCreate({ customerId: session.user.id });
      return c.json({ customer }, 200);
    } catch {
      return c.json({ customer: null }, 200);
    }
  });

export type AppType = typeof app;

// Combine auth + api
import { type Context } from "hono";
const combined = new Hono();
combined.route("/", authApp);
combined.route("/", app);

export default combined;
