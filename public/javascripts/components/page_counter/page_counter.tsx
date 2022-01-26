import * as React from "react";
import classnames from "classnames";

import { Range } from "../../util";

interface PageCounterProps {
  page: number;
  perPage: number;
  totalItems: number;
  maxPagesDisplayed?: number;
  onPageUpdated: (page: number) => void;
}

interface PageButtonsProps {
  page: number;
  lastPage: number;
  maxPagesDisplayed: number;
  onPageUpdated: (page: number) => void;
}

const PageButtons: React.FC<PageButtonsProps> = (props) => {
  const { page, lastPage, maxPagesDisplayed, onPageUpdated } = props;

  const renderPageButton = (n?: number) => {
    if (n == undefined) {
      return (
        <p key={n} className="control">
          <button className={classnames("button", "is-small")}>
            <p>...</p>
          </button>
        </p>
      );
    }

    return (
      <p key={n} className="control">
        <button className={classnames("button", "is-small", { "is-info": page == n, "is-light": page == n })} onClick={onPageUpdated.bind(null, n)}>
          <p className={classnames({ "has-text-weight-bold": page == n})}>
            {n}
          </p>
        </button>
      </p>
    );
  };

  if (lastPage > maxPagesDisplayed) {
    const splitPageCount = Math.ceil(maxPagesDisplayed / 2);

    const pagesDisplayedStart = Range(1, splitPageCount + 1);
    const pagesDisplayedEnd = Range(lastPage - splitPageCount + 1, lastPage + 1);

    let skippedPages = [];

    if (page == splitPageCount + 1) {
      skippedPages = [
        renderPageButton(page),
        renderPageButton()
      ];
    } else if (page == lastPage - splitPageCount) {
      skippedPages = [
        renderPageButton(),
        renderPageButton(page)
      ];
    } else if (page > splitPageCount + 1 && page < lastPage - splitPageCount) {
      skippedPages = [
        renderPageButton(),
        renderPageButton(page - 1),
        renderPageButton(page),
        renderPageButton(page + 1),
        renderPageButton()
      ];
    } else {
      skippedPages = [renderPageButton()];
    }

    return (
      <>
        {pagesDisplayedStart.map((n) => {
          return renderPageButton(n);
        }).concat(
          skippedPages
        ).concat(pagesDisplayedEnd.map((n) => {
          return renderPageButton(n);
        }))}
      </>
    );
  }

  return (
    <>
      {Range(1, lastPage + 1).map((n) => {
        return renderPageButton(n);
      })}
    </>
  );
};

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
