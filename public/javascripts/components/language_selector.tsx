import * as React from "react";
import { useTranslation } from "react-i18next";

import { availableLanguages } from "../util";

interface LanguageSelectorProps {
  value: string;
  available?: Array<{ language: string, default: boolean }>;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = (props) => {
  const { value, available = [], onChange } = props;
  const { t } = useTranslation();

  if (available.length == 0 ) {
    return (
      <div className="select">
        <select value={value} onChange={onChange}>
          {Object.entries(availableLanguages).map(([languageCode, languageName]) => {
            return (
              <option key={languageCode} value={languageCode}>{languageName}</option>
            );
          })}
        </select>
      </div>
    );
  }

  const alreadyTranslated = available.map((entry) => {
    if (availableLanguages[entry.language]) {
      return {
        ...entry,
        languageName: availableLanguages[entry.language]
      };
    } else if (availableLanguages[entry.language.slice(0, 2)]) {
      const languageCode = entry.language.slice(0, 2);

      return {
        ...entry,
        language: languageCode,
        languageName: availableLanguages[languageCode]
      };
    }

    return {
      ...entry,
      languageName: "Unknown"
    };
  });

  const otherLanguages = Object.entries(availableLanguages).filter(([languageCode]) => {
    return !alreadyTranslated.find(({ language }) => language == languageCode);
  });

  return (
    <div className="select">
      <select value={value} onChange={onChange}>
        <optgroup label={t("Defaults")}>
          {alreadyTranslated.map((entry) => {
            return (
              <option key={entry.language} value={entry.language}>
                {entry.languageName} {(entry.default) ? "(Default)" : ""}
              </option>
            );
          })}
        </optgroup>
        <optgroup label={t("Other")}>
          {otherLanguages.map(([languageCode, languageName]) => {
            return (
              <option key={languageCode} value={languageCode}>{languageName}</option>
            );
          })}
        </optgroup>
      </select>
    </div>
  );
};

export default LanguageSelector;
