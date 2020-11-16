import * as React from "react";
import debounce from "lodash.debounce";
import { useTranslation } from "react-i18next";

interface FilterProps {
  delay?: number;
  placeholder?: string;
  searchValueChange: (text: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

const Filter: React.FC<FilterProps> = ({ searchValueChange, delay=500, placeholder="Search...", onKeyDown }) => {
  const { t } = useTranslation();

  const handleChange = debounce((value: string) => {
    searchValueChange(value);
  }, delay);

  return (
    <div className="field has-addons">
      <div className="control is-expanded">
        <input
          className="input"
          type="text"
          placeholder={placeholder}
          onChange={(e) => handleChange(e.currentTarget.value)}
          onKeyDown={onKeyDown}
        />
      </div>
      <div className="control">
        <a className="button is-info">
          {t("Search")}
        </a>
      </div>
    </div>
  );
};

export default Filter;
