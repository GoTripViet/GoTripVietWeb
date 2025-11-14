export default {
  name: "mfeHome",
  filename: "remoteEntry.js",
  exposes: {
    "./Home": "./src/pages/Home.tsx",
  },
  shared: {
    react: { singleton: true, requiredVersion: "*" },
    "react-dom": { singleton: true, requiredVersion: "*" },
  },
};
