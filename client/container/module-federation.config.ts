export default {
  name: "container",
  remotes: {
    mfeAuth: "mfeAuth@http://localhost:4001/remoteEntry.js",
  },
  shared: {
    react: { singleton: true, requiredVersion: "*" },
    "react-dom": { singleton: true, requiredVersion: "*" },
  },
};