import { mainWidth } from 'src/styling/variables'
import fonts from './fonts'

const fill = '100%'

export default `
  ${fonts}
  body {
    font-size: 0.875rem;
    width: ${mainWidth}px;
    display: flex;
    min-height: ${fill};
    @media screen and (min-width: 1200px) {
      width: auto;
    }
  }
  
  html {
    height: ${fill};
    @media screen and (max-height: 900px) {
      scrollbar-gutter: stable;
    }
  }
  
  #root {
    width: ${fill};
    minHeight: ${fill};
  }
  
  .root-notifcenter-open {
    // for when notification center is open
    overflow-y: 'auto';
    position: 'absolute';
    top: 0;
    bottom: 0;
    left: 0;
  }
  
  .body-notifcenter-open {
    // for when notification center is open
    overflow: hidden;
  }
  
  .root-blur {
    filter: blur(1px);
    pointer-events: none;
  }
  
  a::-moz-focus-inner,
  input[type="submit"]::-moz-focus-inner,
  input[type="button"]::-moz-focus-inner {
    border: 0;
  }
  
  a::-moz-focus-inner,
  input[type="submit"]::-moz-focus-inner,
  input[type="button"]::-moz-focus-inner {
    border: 0;
  }
  
  a,
  a:visited,
  a:focus,
  a:active,
  a:hover {
    outline: 0 none;
  }
  
  button::-moz-focus-inner {
    border: 0;
  }
  
  // forcing styling onto inner container
  .ReactVirtualized__Grid__innerScrollContainer {
    overflow: inherit !important;
  },
  .ReactVirtualized__Grid.ReactVirtualized__List {
    overflow-y: overlay !important;
  }
`
