import { createGlobalStyle } from "styled-components";
import { SiteTheme } from "./themes";

const GlobalStyles = createGlobalStyle<{ theme: SiteTheme }>`
  html, body {
    background-color: ${({ theme }) => theme.colors.backgroundColor};
  }

  .navbar {
    background-color: ${({ theme }) => theme.colors.headerColor};
  }

  .button.is-info {
    background-color: ${({ theme }) => theme.colors.buttonColor};
  }
`;

export default GlobalStyles;
