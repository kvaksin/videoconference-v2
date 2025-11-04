/// <reference types="react" />
/// <reference types="react-dom" />

// Ensure JSX namespace is available
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
    interface Element extends React.ReactElement<any, any> {}
    interface ElementClass extends React.Component<any> {}
    interface ElementAttributesProperty { props: {}; }
    interface ElementChildrenAttribute { children: {}; }
  }
}

// Module declarations for packages that might not have complete type definitions
declare module 'axios' {
  export * from 'axios/index';
}

declare module 'socket.io-client' {
  export * from 'socket.io-client/build/esm';
}

// React module augmentation
declare namespace React {
  interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    // Ensure all HTML attributes are properly typed
  }
}

export {};