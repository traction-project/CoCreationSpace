import * as React from "react";
import { useState } from "react";

import i18n from "../i18n";

const availableTranslations: { [key: string]: string } = {
  en: "English",
  de: "Deutsch",
  es: "Español"
};

interface LanguageSwitcherProps {
  onLangaugeChanged?: (selectedLanguage: string, languageName: string) => void;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = (props) => {
  const { onLangaugeChanged } = props;
  const [ language, setLanguage ] = useState(
    i18n.language || Object.values(availableTranslations)[0]
  );

  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;

    setLanguage(code);
    i18n.changeLanguage(code);
    onLangaugeChanged?.(code, availableTranslations[code]);
  };

  return (
    <div className="select">
      <select value={language} onChange={onChange}>
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
