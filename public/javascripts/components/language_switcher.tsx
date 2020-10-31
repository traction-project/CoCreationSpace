import * as React from "react";
import { useState } from "react";

import i18n from "../i18n";

const availableLanguages: { [key: string]: string } = {
  en: "English",
  de: "Deutsch",
  es: "Español"
};

interface LanguageSwitcherProps {
  onLangaugeChanged?: (selectedLanguage: string, languageName: string) => void;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = (props) => {
  const { onLangaugeChanged } = props;
  const [ language, setLanguage ] = useState(Object.values(availableLanguages)[0]);

  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;

    setLanguage(code);
    i18n.changeLanguage(code);
    onLangaugeChanged?.(code, availableLanguages[code]);
  };

  return (
    <div className="select">
      <select value={language} onChange={onChange}>
        {Object.entries(availableLanguages).map(([languageCode, languageName]) => {
          return (
            <option key={languageCode} value={languageCode}>{languageName}</option>
          );
        })}
      </select>
    </div>
  );
};

export default LanguageSwitcher;
