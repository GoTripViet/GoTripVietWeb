export default{
  name: "mfeAuth",
  filename: "remoteEntry.js",
  exposes: {
    "./Login": "./src/pages/Login.tsx",
    "./AuthHeader": "./src/components/AuthHeader.tsx",
    "./OtpVerify": "./src/pages/OtpVerify.tsx"   
  },
  shared: {
    react: { singleton: true, requiredVersion: "*" },
    "react-dom": { singleton: true, requiredVersion: "*" },
  },
};
