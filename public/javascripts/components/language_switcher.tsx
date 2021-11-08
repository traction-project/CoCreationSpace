import * as React from "react";
import { useState } from "react";
import { FieldValues, UseFormRegister } from "react-hook-form";

import i18n from "../i18n";

const availableTranslations: { [key: string]: string } = {
  en: "English",
  de: "Deutsch",
  es: "Español",
  ga: "Gaeilge",
  pt: "Português",
  ca: "Català"
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
  onLanguageChanged?: (selectedLanguage: string, languageName: string) => void;
  registerFunction?: UseFormRegister<FieldValues>;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = (props) => {
  const { onLanguageChanged, registerFunction } = props;
  const [ languageCode, setLanguageCode ] = useState(processDetectedLanguage());

  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;

    setLanguageCode(code);
    i18n.changeLanguage(code);
    onLanguageChanged?.(code, availableTranslations[code]);
  };

  return (
    <div className="select">
      <select value={languageCode} onChange={onChange} {...registerFunction?.("preferredLanguage", { onChange: onChange, value: languageCode })}>
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
