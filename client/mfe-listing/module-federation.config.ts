export const mfConfig = {
  name: "mfeListing",
  filename: "remoteEntry.js",
  exposes: {
    "./ListingHotel": "./src/pages/ListingHotel.tsx",
  },
  shared: {
    react: { singleton: true, requiredVersion: "*" },
    "react-dom": { singleton: true, requiredVersion: "*" },
  },
};
