declare module '*.svg' {
  const value: any;
  export = value;
}

declare module '*.png' {
  const value: any;
  export = value;
}

declare var grecaptcha: {
  enterprise: ReCaptchaV3.ReCaptcha;
};

declare namespace ReCaptchaV3 {
  interface ReCaptcha {
    execute(siteKey: string, action: Action): PromiseLike<string>;
    ready(callback: () => void): void;
  }
  interface Action {
    /**
     * the name of the action. Actions may only contain alphanumeric characters and slashes, and must not be user-specific.
     */
    action: string;
  }
}
