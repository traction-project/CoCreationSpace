import * as React from "react";

const CookieBanner: React.FC = () => {
  const onAccept = () => {
    localStorage.setItem("gdprCookieConsent", "true");
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
