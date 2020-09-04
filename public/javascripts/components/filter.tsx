import * as React from "react";
import { debounce } from "lodash";


interface FilterProps {
  delay?: number;
  searchValueChange: (text: string) => void;
}

const Filter: React.FC<FilterProps> = ({ searchValueChange, delay=500 }) => {
  
  const handleChange = debounce((value: string) => {
    console.log("Valor cambiado: " + value);
    searchValueChange(value);
  }, delay);

  return (
    <React.Fragment>
      <input type="text" onChange={(e) => {handleChange(e.currentTarget.value);}}/>
    </React.Fragment>
  );
};

export default Filter;