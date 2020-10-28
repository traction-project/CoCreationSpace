import * as React from "react";
import { useEffect, useState } from "react";

interface StartupProps {
  condition: () => Promise<void>;
}

const Startup: React.FC<StartupProps> = (props) => {
  const [ appInitialised, setAppInitialised ] = useState(false);

  useEffect(() => {
    props.condition().then(() => {
      setAppInitialised(true);
    });
  }, []);

  return (
    (appInitialised) ? (
      <>{props.children}</>
    ) : (
      <p>Loading...</p>
    )
  );
};

export default Startup;
