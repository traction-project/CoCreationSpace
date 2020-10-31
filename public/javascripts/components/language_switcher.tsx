import * as React from "react";
import { useState } from "react";

import i18n from "../i18n";

const availableTranslations: { [key: string]: string } = {
  en: "English",
  de: "Deutsch",
  es: "Español"
};

function processDetectedLanguage() {
  const languageCodes = Object.keys(availableTranslations);
  const matchingLanguageCode = languageCodes.find((t) => i18n.language.startsWith(t));

  if (matchingLanguageCode) {
    return matchingLanguageCode;
  } else {
    return languageCodes[0];
  }
}

interface LanguageSwitcherProps {
  onLangaugeChanged?: (selectedLanguage: string, languageName: string) => void;

  childRef?: (elem: HTMLSelectElement) => void;
  childName?: string;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = (props) => {
  const { onLangaugeChanged, childRef, childName } = props;
  const [ languageCode, setLanguageCode ] = useState(processDetectedLanguage());

  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;

    setLanguageCode(code);
    i18n.changeLanguage(code);
    onLangaugeChanged?.(code, availableTranslations[code]);
  };

  return (
    <div className="select">
      <select name={childName || "languageCode"} value={languageCode} onChange={onChange} ref={childRef}>
        {Object.entries(availableTranslations).map(([languageCode, languageName]) => {
          return (
            <option key={languageCode} value={languageCode}>{languageName}</option>
          );
        })}
      </select>
    </div>
  );
};

export default LanguageSwitcher;
