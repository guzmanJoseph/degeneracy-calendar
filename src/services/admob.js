import { Capacitor } from "@capacitor/core";

import {
  AdMob,
  BannerAdSize,
  BannerAdPosition,
  BannerAdPluginEvents,
  AdmobConsentStatus,
} from "@capacitor-community/admob";

// Production Banner Ad Unit ID
const BANNER_ID =
  "ca-app-pub-2360932378595904/5173751228";

// Production App Open Ad Unit ID
const APP_OPEN_ID =
  "ca-app-pub-2360932378595904/2119308511";

export async function initializeAds() {
  if (!Capacitor.isNativePlatform()) {
    console.log("AdMob skipped: not native");
    return false;
  }

  try {
    console.log("Initializing AdMob...");

    await AdMob.initialize();

    console.log("AdMob initialized");

    let consentInfo =
      await AdMob.requestConsentInfo();

    console.log(
      "Consent info:",
      consentInfo
    );

    if (
      consentInfo.isConsentFormAvailable &&
      consentInfo.status ===
        AdmobConsentStatus.REQUIRED
    ) {
      consentInfo =
        await AdMob.showConsentForm();
    }

    console.log(
      "Can request ads:",
      consentInfo.canRequestAds
    );

    return consentInfo.canRequestAds;
  } catch (error) {
    console.error(
      "AdMob initialization failed:",
      error
    );

    return false;
  }
}

export async function showBanner() {
  if (!Capacitor.isNativePlatform()) return;

  try {
    await AdMob.addListener(
      BannerAdPluginEvents.Loaded,
      () => {
        console.log("Banner loaded");
      }
    );

    await AdMob.addListener(
      BannerAdPluginEvents.FailedToLoad,
      (error) => {
        console.error(
          "Banner failed to load:",
          error
        );
      }
    );

    console.log("Requesting banner...");

    await AdMob.showBanner({
      adId: BANNER_ID,
      adSize: BannerAdSize.BANNER,
      position:
        BannerAdPosition.BOTTOM_CENTER,
      margin: 80,
    });

    console.log("Banner requested");
  } catch (error) {
    console.error(
      "Banner error:",
      error
    );
  }
}

export async function showAppOpen() {
  if (!Capacitor.isNativePlatform()) return;

  try {
    console.log(
      "Loading App Open ad..."
    );

    await AdMob.loadAppOpen({
      adId: APP_OPEN_ID,
    });

    const { value } =
      await AdMob.isAppOpenLoaded();

    console.log(
      "App Open loaded:",
      value
    );

    if (!value) {
      console.log(
        "App Open ad was not ready"
      );

      return;
    }

    await AdMob.showAppOpen();

    console.log(
      "App Open shown"
    );
  } catch (error) {
    console.error(
      "App Open error:",
      error
    );
  }
}

export async function removeBanner() {
  if (!Capacitor.isNativePlatform()) return;

  try {
    await AdMob.removeBanner();
  } catch (error) {
    console.error(
      "Remove banner error:",
      error
    );
  }
}

export async function showPrivacyOptions() {
  if (!Capacitor.isNativePlatform()) return;

  try {
    await AdMob.showPrivacyOptionsForm();
  } catch (error) {
    console.error(
      "Privacy options error:",
      error
    );
  }
}