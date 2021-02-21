import * as React from "react";
import { useEffect } from "react";
import { useHistory } from "react-router-dom";

interface HistoryTrackerProps {
  endpoint: string;
}

const HistoryTracker: React.FC<HistoryTrackerProps> = (props) => {
  const history = useHistory();

  useEffect(() => {
    const removeListener = history.listen((location, action) => {
      console.log(location, action);
    });

    return () => {
      removeListener();
    };
  }, []);

  return (
    <>
      {props.children}
    </>
  );
};

export default HistoryTracker;
