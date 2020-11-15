import * as React from "react";
import { useState } from "react";

function getCookieConsentStatus() {
  const hasConsented = localStorage.getItem("gdprCookieConsent");

  if (hasConsented != null && hasConsented == "true") {
    return true;
  }

  return false;
}

const CookieBanner: React.FC = () => {
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
            The cookies on this website are used to personalize content, store session data
            and improve your browsing experience. We do not share your data with any third
            party.
          </p>
          <button className="button is-info" onClick={onAccept}>
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
