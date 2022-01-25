export interface SiteTheme {
  id: string;
  name: string;
  colors: {
    backgroundColor: string;
    headerColor: string;
    buttonColor: string;
  }
}

interface Themes {
  data: {
    [name: string]: SiteTheme
  }
}

export const themes: Themes = {
  data: {
    default: {
      id: "default",
      name: "Default theme",
      colors: {
        backgroundColor: "#FFFFFF",
        headerColor: "#55AABB",
        buttonColor: "#3298DC",
      }
    },
    theme1: {
      id: "theme1",
      name: "Theme 1",
      colors: {
        backgroundColor: "#DAE6BF",
        headerColor: "#981D16",
        buttonColor: "#971D16",
      }
    },
    theme2: {
      id: "theme2",
      name: "Theme 2",
      colors: {
        backgroundColor: "#F8F7F6",
        headerColor: "#CE278B",
        buttonColor: "#210108",
      }
    },
    theme3: {
      id: "theme3",
      name: "Theme 3",
      colors: {
        backgroundColor: "#D7CD45",
        headerColor: "#1F0207",
        buttonColor: "#1F0107",
      }
    },
    theme4: {
      id: "theme4",
      name: "Theme 4",
      colors: {
        backgroundColor: "#FEFDBD",
        headerColor: "#5E3B99",
        buttonColor: "#1F0107",
      }
    },
  }
};
