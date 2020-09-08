import * as React from "react";
import { Link } from "react-router-dom";

interface HomeProps {}

const Home: React.FC<HomeProps> = () => {
    
  return (
    <div className="columns" style={{ marginTop: 15 }}>
      <div className="column is-8 is-offset-2">
        <h1 className="home__title">MediaVault</h1>
        <ul className="home__menu">
          <Link to={"userPosts"}><li className="home__menu-item">My Posts</li></Link>
          <Link to={"tags"}><li className="home__menu-item">Tags</li></Link>
          <Link to={"upload"}><li className="home__menu-item">Create</li></Link>
        </ul>
      </div>
    </div>
  );
};

export default Home;
