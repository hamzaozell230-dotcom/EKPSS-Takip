import { Capacitor } from "@capacitor/core";
import icon from "@/assets/ekpss-icon.png.asset.json";

// APKs carry a local copy so identity renders without a network connection.
export function brandIconUrl() {
  return Capacitor.isNativePlatform() ? "/icon-512.png" : icon.url;
}