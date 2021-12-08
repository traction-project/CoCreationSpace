import * as React from "react";

interface AddChapterIconProps {
  onClick: () => void;
}

const AddChapterIcon: React.FC<AddChapterIconProps> = ({ onClick }) => {
  return (
    <div
      style={{
        position: "absolute",
        top: 60, right: 15,
        width: 30, height: 30,
        borderRadius: 2,
        backgroundColor: "#FFFFFF",
        boxShadow: "1px 1px 3px 0px rgba(60,60,60,0.75)",
        cursor: "pointer"
      }}
      onClick={onClick}
    >
      <p style={{ textAlign: "center", marginTop: 5 }}>
        <i className="fas fa-book-open" style={{ fontSize: 20 }} />
      </p>
    </div>
  );
};

export default AddChapterIcon;
