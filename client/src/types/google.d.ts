// Type declarations for Google Identity Services (GIS)
// https://developers.google.com/identity/gsi/web/reference/js-reference

interface GoogleCredentialResponse {
  credential: string;
  select_by: string;
  clientId?: string;
}

interface GoogleIdConfiguration {
  client_id: string;
  callback: (response: GoogleCredentialResponse) => void;
  auto_select?: boolean;
  cancel_on_tap_outside?: boolean;
  context?: "signin" | "signup" | "use";
  itp_support?: boolean;
  login_uri?: string;
  native_callback?: (response: GoogleCredentialResponse) => void;
  nonce?: string;
  use_fedcm_for_prompt?: boolean;
}

interface GoogleButtonConfiguration {
  type?: "standard" | "icon";
  theme?: "outline" | "filled_blue" | "filled_black";
  size?: "large" | "medium" | "small";
  text?: "signin_with" | "signup_with" | "continue_with" | "signin";
  shape?: "rectangular" | "pill" | "circle" | "square";
  logo_alignment?: "left" | "center";
  width?: string | number;
  locale?: string;
}

interface Google {
  accounts: {
    id: {
      initialize: (config: GoogleIdConfiguration) => void;
      renderButton: (
        element: HTMLElement,
        config: GoogleButtonConfiguration,
      ) => void;
      prompt: () => void;
      disableAutoSelect: () => void;
      revoke: (
        hint: string,
        callback?: (response: { successful: boolean; error?: string }) => void,
      ) => void;
      cancel: () => void;
    };
  };
}

declare global {
  interface Window {
    google?: Google;
  }
  // eslint-disable-next-line no-var
  var google: Google | undefined;
}

export {};
