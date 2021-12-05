import * as React from "react";
import usePortal from "react-useportal";

import AddToCollectionModal from "./add_to_collection_modal";

interface NoteIconProps {
  id: string;
}

const NoteIcon: React.FC<NoteIconProps> = (props) => {
  const { id } = props;
  const { isOpen, openPortal, closePortal, Portal } = usePortal();

  return (
    <>
      <div
        style={{
          position: "absolute",
          top: 15, right: 15,
          width: 30, height: 30,
          borderRadius: 2,
          backgroundColor: "#FFFFFF",
          boxShadow: "1px 1px 3px 0px rgba(60,60,60,0.75)",
          cursor: "pointer"
        }}
        onClick={openPortal}
      >
        <p style={{ textAlign: "center", marginTop: 5 }}>
          <i className="far fa-bookmark" style={{ fontSize: 20 }} />
        </p>
      </div>

      {isOpen && (
        <Portal>
          <AddToCollectionModal
            id={id}
            onClose={closePortal}
          />
        </Portal>
      )}
    </>
  );
};

export default NoteIcon;
