import * as React from "react";
import { Suspense, useState } from "react";

const Document = React.lazy(() => import("./reexport/document"));
const Page = React.lazy(() => import("./reexport/page"));

interface PdfDocumentProps {
    url: string;
}

const PdfDocument: React.FC<PdfDocumentProps> = (props) => {
  const { url } = props;
  const [ numPages, setNumPages ] = useState<number>();
  const [ pageNumber, setPageNumber ] = useState<number>();

  const onDocumentLoaded = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const onNextPage = () => {
    if (numPages && pageNumber) {
      if (pageNumber < numPages) {
        setPageNumber(pageNumber + 1);
      }
    }
  };

  const onPrevPage = () => {
    if (numPages && pageNumber) {
      if (pageNumber > 0) {
        setPageNumber(pageNumber - 1);
      }
    }
  };

  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <Document file={url} onLoadSuccess={onDocumentLoaded}>
          <Page pageNumber={pageNumber} />
        </Document>
        <p style={{ textAlign: "center" }}>
          <a onClick={onPrevPage}>Prev</a>&emsp;
          {pageNumber}/{numPages}&emsp;
          <a onClick={onNextPage}>Next</a>
        </p>
      </Suspense>
    </div>
  );
};

export default PdfDocument;
