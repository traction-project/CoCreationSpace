import * as React from "react";
import debounce from "lodash.debounce";
import { useTranslation } from "react-i18next";

interface FilterProps {
  value?: string;
  delay?: number;
  placeholder?: string;
  searchValueChange: (text: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

const Filter: React.FC<FilterProps> = ({ value, searchValueChange, delay=500, placeholder="Search...", onKeyDown }) => {
  const { t } = useTranslation();

  const handleChange = debounce((value: string) => {
    if (value.length >= 3 || value.length == 0) {
      searchValueChange(value);
    }
  }, delay);

  return (
    <div className="field has-addons">
      <div className="control is-expanded">
        <input
          className="input"
          type="text"
          defaultValue={value}
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
