import * as React from "react";

interface VideoWithToolbarProps {
  video: 
}

const VideoWithToolbar: React.FC<VideoWithToolbarProps> = (props) => {
  return (
    <nav className="level is-mobile" style={{position: "relative"}}>
      <div className="level-left">
        {(post.dataContainer?.multimedia && post.dataContainer?.multimedia.length > 0) && (
          <Fragment>
            <div className={`emoji-container ${showEmojis ? "" : "hidden"}`}>
              {emojis.map((emoji, index) => {
                return (
                  <button key={index} className="emoji-item" onClick={() => handleClickEmojiItem(emoji)}>{emoji}</button>
                );
              })}
            </div>

            <a className="level-item button is-info is-small" onClick={handleClickEmojiButton}>
              <span className="icon is-small">
                <i className="fas fa-smile"></i>
              </span>
            </a>

            {(!post.parent_post_id) && (
              <a className="level-item" onClick={(e) => openPortal(e)}>
                <span className="icon is-small">
                  <i className="fas fa-language"/>
                </span>
              </a>
            )}

            {isOpen && (
              <Portal>
                <TranslationModal
                  id={post.dataContainer.multimedia[0].id!}
                  onSuccess={handleTranslationSuccess}
                  onClose={closePortal}
                />
              </Portal>
            )}
          </Fragment>
        )}
      </div>
    </nav>
  );
};

export default VideoWithToolbar;
