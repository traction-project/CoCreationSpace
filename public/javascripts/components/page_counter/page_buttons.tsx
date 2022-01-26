import * as React from "react";
import classnames from "classnames";

import { Range } from "../../util";

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

export default PageButtons;
