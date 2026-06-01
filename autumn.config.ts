import { feature, plan, item } from "atmn";

// ─── Features ───
export const postListing = feature({
  id: "post_listing",
  name: "Poster une annonce",
  type: "metered",
  consumable: false,
});

export const sendMessage = feature({
  id: "send_message",
  name: "Envoyer un message",
  type: "metered",
  consumable: true,
});

export const featuredListing = feature({
  id: "featured_listing",
  name: "Annonce mise en avant",
  type: "metered",
  consumable: false,
});

// ─── Plans ───
export const free = plan({
  id: "free",
  name: "Free",
  autoEnable: true,
  items: [
    item({
      featureId: postListing.id,
      included: 0,
    }),
    item({
      featureId: sendMessage.id,
      included: 0,
      reset: { interval: "month" },
    }),
    item({
      featureId: featuredListing.id,
      included: 0,
    }),
  ],
});

export const pro = plan({
  id: "pro",
  name: "Pro",
  price: { amount: 1900, interval: "month" },
  items: [
    item({
      featureId: postListing.id,
      included: 10,
    }),
    item({
      featureId: sendMessage.id,
      included: 500,
      reset: { interval: "month" },
    }),
    item({
      featureId: featuredListing.id,
      included: 0,
    }),
  ],
});

export const vip = plan({
  id: "vip",
  name: "VIP",
  price: { amount: 4900, interval: "month" },
  items: [
    item({
      featureId: postListing.id,
      included: 999,
    }),
    item({
      featureId: sendMessage.id,
      included: 999,
      reset: { interval: "month" },
    }),
    item({
      featureId: featuredListing.id,
      included: 3,
    }),
  ],
});

export default {
  features: [postListing, sendMessage, featuredListing],
  plans: [free, pro, vip],
};
