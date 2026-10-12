# Madni Dukhana – Expo Mobile App (setup)

## Zaroori: Firebase ka ek hi version rakhein
Firebase ko `12.19.0` par pin karein aur `@firebase/app` ki sirf EK copy honi chahiye.
Warna "Component auth has not been registered yet" error aata hai.

```
Remove-Item -Recurse -Force node_modules\firebase, node_modules\@firebase -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue
npm install firebase@12.19.0 --save-exact
```

Check (ye "Cannot find path" de to theek hai):
```
dir node_modules\firebase\node_modules
```

## Packages (agar pehle install nahi kiye)
```
npx expo install react-native-safe-area-context @react-native-async-storage/async-storage expo-print expo-sharing
```

## Chalayein
```
npx expo start -c
```

## APK banana
```
npm install -g eas-cli
eas login
eas build -p android --profile preview
```
