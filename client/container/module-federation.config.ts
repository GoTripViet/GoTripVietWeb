export default {
  name: "container",
  remotes: {
    mfeAuth: "mfeAuth@http://localhost:4001/remoteEntry.js",
    mfeHome: "mfeHome@http://localhost:4002/remoteEntry.js",
    mfeListing: "mfeListing@http://localhost:4003/remoteEntry.js",
  },
  shared: {
    react: { singleton: true, requiredVersion: "*" },
    "react-dom": { singleton: true, requiredVersion: "*" },
  },
};