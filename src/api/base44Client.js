// This is a "Mock" client to bypass Base44's paid cloud.
// It allows Moreki to run on Vercel for free while we build your new backend.

export const base44 = {
  // We'll add "fake" functions here so your pages think they're talking to a database
  entities: (name) => ({
    list: async () => [], // Returns an empty list so pages don't crash
    get: async (id) => ({ id, name: "Sample Data" }),
    create: async (data) => data,
    update: async (id, data) => data,
  }),
  auth: {
    user: { id: "test-user-123", name: "A34 Admin" },
    signOut: async () => console.log("Sign out triggered"),
  },
  // Add any other functions that your "initializeMall" or "LoyaltyCards" use
};

export default base44;
