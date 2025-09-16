import "../global.css";
import { Slot } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppProviders } from "@/shared/providers/AppProviders";

export default function Layout() {
  return (
    <SafeAreaProvider>
      <AppProviders>
        <Slot />
      </AppProviders>
    </SafeAreaProvider>
  );
}
