import * as React from "react";
import classnames from "classnames";

import { Range } from "../../util";

interface PageCounterProps {
  page: number;
  perPage: number;
  totalItems: number;
  onPageUpdated: (page: number) => void;
}

const PageCounter: React.FC<PageCounterProps> = (props) => {
  const { page, perPage, totalItems, onPageUpdated } = props;
  const lastPage = Math.ceil(totalItems / perPage);

  if (totalItems <= perPage) {
    return null;
  }

  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: "2rem" }}>
      <div className="field has-addons">
        <p className="control">
          <button className="button is-small is-info" onClick={() => (page > 1) && onPageUpdated(page - 1)}>
            <i className="fas fa-caret-left" />
          </button>
        </p>

        {Range(1, lastPage + 1).map((n) => {
          return (
            <p key={n} className="control">
              <button className={classnames("button", "is-small", { "is-info": page == n, "is-light": page == n })} onClick={onPageUpdated.bind(null, n)}>
                <p className={classnames({ "has-text-weight-bold": page == n})}>
                  {n}
                </p>
              </button>
            </p>
          );
        })}

        <p className="control">
          <button className="button is-small is-info" onClick={() => (page < lastPage) && onPageUpdated(page + 1)}>
            <i className="fas fa-caret-right" />
          </button>
        </p>
      </div>
    </div>
  );
};

export default PageCounter;
