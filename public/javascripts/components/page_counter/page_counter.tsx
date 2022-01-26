import * as React from "react";
import PageButtons from "./page_buttons";

interface PageCounterProps {
  page: number;
  perPage: number;
  totalItems: number;
  maxPagesDisplayed?: number;
  onPageUpdated: (page: number) => void;
}

const PageCounter: React.FC<PageCounterProps> = (props) => {
  const { page, perPage, totalItems, maxPagesDisplayed = 8, onPageUpdated } = props;
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

        <PageButtons
          page={page}
          lastPage={lastPage}
          maxPagesDisplayed={maxPagesDisplayed}
          onPageUpdated={onPageUpdated}
        />

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
