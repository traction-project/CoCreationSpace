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
  }
};
