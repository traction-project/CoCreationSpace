import * as React from "react";
import { useEffect, useState } from "react";
import classNames from "classnames";

interface FavouriteToggleProps {
  postId: string;
}

const FavouriteToggle: React.FC<FavouriteToggleProps> = ({ postId }) => {
  const [ isFavourite, setIsFavourite ] = useState(false);

  useEffect(() => {
    fetch(`/posts/${postId}/favourite`).then((res) => {
      return res.json();
    }).then((data) => {
      setIsFavourite(data.favourite);
    });
  }, [ postId ]);

  const toggleFavourite = async () => {
    const res = await fetch(`/posts/${postId}/favourite`, {
      method: (isFavourite) ? "DELETE" : "POST"
    });

    if (res.ok) {
      setIsFavourite((favourite) => !favourite);
    }
  };

  return (
    <i
      style={{ color: "#F0BC00", cursor: "pointer" }}
      className={classNames((isFavourite) ? "fas" : "far", "fa-star")}
      onClick={toggleFavourite}
    />
  );
};

export default FavouriteToggle;
