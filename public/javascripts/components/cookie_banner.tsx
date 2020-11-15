import * as React from "react";
import { useState } from "react";
import { useTranslation, Trans } from "react-i18next";

function getCookieConsentStatus() {
  const hasConsented = localStorage.getItem("gdprCookieConsent");

  if (hasConsented != null && hasConsented == "true") {
    return true;
  }

  return false;
}

const CookieBanner: React.FC = () => {
  const { t } = useTranslation();
  const [ cookiesConsented, setCookiesConsented ] = useState(getCookieConsentStatus());

  if (cookiesConsented) {
    return null;
  }

  const onAccept = () => {
    localStorage.setItem("gdprCookieConsent", "true");
    setCookiesConsented(true);
  };

  return (
    <div className="columns">
      <div className="column cookie-banner is-3-desktop is-3-widescreen is-6-tablet">
        <div className="box">
          <p>
            <Trans i18nKey="cookie-notice">
              The cookies on this website are used to personalize content, store session data
              and improve your browsing experience. We do not share your data with any third
              party.
            </Trans>
          </p>
          <button className="button is-info" onClick={onAccept}>
            {t("Accept")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
