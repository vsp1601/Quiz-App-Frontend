// app.config.js
module.exports = {
  expo: {
    name: "fashion-reco",
    slug: "fashion-reco",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "fashionreco",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: { supportsTablet: true },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      edgeToEdgeEnabled: true,
    },
    web: {
      bundler: "metro",
      output: "static",               // 🔒 force static, no SSR
      favicon: "./assets/images/favicon.png",
    },
    extra: {
      API_BASE_URL: "http://192.168.0.2:8000",
    },
    plugins: [
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
        },
      ],
    ],
    // 🚫 No `experiments.typedRoutes`, no `expo-router` plugin
  },
};
