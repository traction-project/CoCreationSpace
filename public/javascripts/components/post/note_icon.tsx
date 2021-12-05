import * as React from "react";

interface NoteIconProps {
  id: string;
}

const NoteIcon: React.FC<NoteIconProps> = (props) => {
  const { id } = props;

  return (
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
      onClick={() => {}}
    >
      <p style={{ textAlign: "center", marginTop: 5 }}>
        <i className="far fa-bookmark" style={{ fontSize: 20 }} />
      </p>
    </div>
  );
};

export default NoteIcon;
