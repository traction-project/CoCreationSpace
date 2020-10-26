import * as React from "react";
import { availableLanguages } from "../util";

interface LanguageSelectorProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = (props) => {
  const { value, onChange } = props;

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
};

export default LanguageSelector;
