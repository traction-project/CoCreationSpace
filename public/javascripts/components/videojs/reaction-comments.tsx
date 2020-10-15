import * as React from "react";
import { Component } from "react";
import * as ReactDOM from "react-dom";
import videojs, { VideoJsPlayer } from "video.js";
import { PostType } from "../post";

const vjsComponent = videojs.getComponent("Component");

class ReactionContainer extends Component<ReactionListProps> {
  private comments: PostType[] = [];

  constructor(props: ReactionListProps) {
    super(props);
    this.comments = props.comments;
  }

  render() {
    return (
      <div className="reaction-container">
        <ReactionList comments={this.comments}/>
      </div>
    );
  }
}

type ReactionListProps = {
  comments: PostType[];
}
class ReactionList extends Component<ReactionListProps, ReactionListProps> {
  constructor(props: ReactionListProps) {
    super(props);

    this.state = {
      comments: []
    };
  }

  componentDidMount() {
    this.getComments();
  }

  getComments(): void {
    const { comments } = this.props;

    Promise.all(comments.map(comment => {
      fetch(`/posts/id/${comment.id}`)
        .then((res) => res.json())
        .then((data) => {
          this.setState({
            comments: [...this.state.comments, data]
          });
        });
    }));
  }

  addMessage(message: PostType) {
    this.setState(function(state, props) {
      return {
        comments: [message, ...state.comments]
      };
    });
  }

  render() {

    const commentsEl = this.state.comments.map((message, index) => {
      return (
        <div key={index} className="reaction">
          <span className="reaction__username">{message.user.username}</span>
          <span className="reaction__text">{message.dataContainer?.text_content}</span>
        </div>
      );
    });

    return (
      <div className="reaction-list">
        {commentsEl}
      </div>
    );
  }
}

export default class vjsReactionComments extends vjsComponent {

  constructor(player: VideoJsPlayer, options: (videojs.ComponentOptions & {comments?: PostType[]})) {
    super(player, options);

    this.mount = this.mount.bind(this);
    const { comments } = options;
    player.ready(() => {
      this.mount(comments);
    });
    this.on("dispose", () => {
      ReactDOM.unmountComponentAtNode(this.el());
    });
  }

  mount(comments?: PostType[]) {
    ReactDOM.render(<ReactionContainer comments={comments ? comments : []}/>, this.el());
  }
}

vjsComponent.registerComponent("vjsReactionComments", vjsReactionComments);