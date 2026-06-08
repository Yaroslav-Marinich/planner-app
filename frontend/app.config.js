const IS_DEV = process.env.EAS_BUILD_PROFILE === 'development';

export default {
  expo: {
    name: IS_DEV ? "SimPlanner (Dev)" : "SimPlanner",
    slug: "sim-planner", // Унікальний slug для нового додатку
    version: "1.0.0",
    orientation: "portrait",
    icon: "./src/assets/images/icon.png",
    scheme: "sim-planner", // Унікальна схема для глибоких посилань (deep links)
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    
    // ПРИМІТКА: Блок updates та extra.eas.projectId я поки закоментував. 
    // Коли ви ініціалізуєте цей проєкт в Expo (EAS) командою `eas init`, 
    // Expo сам згенерує для вас нові унікальні ID, і ви їх сюди впишете.
    /*
    updates: {
      url: "https://u.expo.dev/ВАШ-НОВИЙ-PROJECT-ID",
      requestHeaders: {
        "expo-channel-name": "production"
      },
    },
    runtimeVersion: {
      policy: "appVersion"
    },
    extra: {
      router: {},
      eas: {
        projectId: "ВАШ-НОВИЙ-PROJECT-ID"
      }
    },
    */

    ios: {
      supportsTablet: true
    },
    android: {
      package: IS_DEV ? "com.simplaner.planerapp.dev" : "com.simplaner.planerapp",
      versionCode: 1,
      version: "1.0.0",
      googleServicesFile: "./google-services.json",
      adaptiveIcon: {
        foregroundImage: "./src/assets/images/icon.png",
        backgroundColor: "#ffffff"
      },
      predictiveBackGestureEnabled: false
    },
    web: {
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          "image": "./src/assets/images/logo.png",
          "imageWidth": 200,
          "resizeMode": "contain",
          "backgroundColor": "#121212",
          "dark": {
            "backgroundColor": "#121212"
          }
        }
      ],
      "@react-native-google-signin/google-signin",
      "@react-native-community/datetimepicker",
      // "./plugins/withJvmArgs", // РОЗКОМЕНТУЙТЕ, якщо перенесли цей локальний плагін у новий проєкт
      [
        "expo-notifications",
        {
          icon: "./src/assets/images/notification-icon.png",
          color: "#F7931A"
        }
      ]
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true
    }
  }
};