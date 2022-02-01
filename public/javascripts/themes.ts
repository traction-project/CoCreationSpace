export interface SiteTheme {
  id: string;
  name: string;
  colors: {
    backgroundColor: string;
    headerColor: string;
    boxShadow: string;
    button: {
      backgroundColor: string;
      textColor: string;
    };
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
        boxShadow: "#F2F2F2",
        button: {
          backgroundColor: "#3298DC",
          textColor: "#FFFFFF"
        }
      }
    },
    liceu: {
      id: "liceu",
      name: "LICEU",
      colors: {
        backgroundColor: "#FFFFFF",
        headerColor: "#D20A11",
        boxShadow: "#F2F2F2",
        button: {
          backgroundColor: "#A7192F",
          textColor: "#FFFFFF"
        }
      }
    },
    theme1: {
      id: "theme1",
      name: "Theme 1",
      colors: {
        backgroundColor: "#DAE6BF",
        headerColor: "#981D16",
        boxShadow: "#999999",
        button: {
          backgroundColor: "#971D16",
          textColor: "#FFFFFF"
        }
      }
    },
    theme2: {
      id: "theme2",
      name: "Theme 2",
      colors: {
        backgroundColor: "#F8F7F6",
        headerColor: "#CE278B",
        boxShadow: "#F2F2F2",
        button: {
          backgroundColor: "#210108",
          textColor: "#FFFFFF"
        }
      }
    },
    theme3: {
      id: "theme3",
      name: "Theme 3",
      colors: {
        backgroundColor: "#D7CD45",
        headerColor: "#1F0207",
        boxShadow: "#999999",
        button: {
          backgroundColor: "#1F0107",
          textColor: "#FFFFFF"
        }
      }
    },
    theme4: {
      id: "theme4",
      name: "Theme 4",
      colors: {
        backgroundColor: "#FEFDBD",
        headerColor: "#5E3B99",
        boxShadow: "#F2F2F2",
        button: {
          backgroundColor: "#1F0107",
          textColor: "#FFFFFF"
        }
      }
    },
  }
};
