declare module "mfeAuth/Login" {
  import { ComponentType } from "react";
  export type LoginProps = { onNext: (email: string) => void | Promise<void> };
  const C: ComponentType<LoginProps>;
  export default C;
}

declare module "mfeAuth/OtpVerify" {
  import { ComponentType } from "react";
  type Props = {
    email: string;
    onBackToLogin?: () => void;
    onResend?: () => void;
    onSubmit?: (code: string) => void;
  };
  const C: ComponentType<Props>;
  export default C;
}