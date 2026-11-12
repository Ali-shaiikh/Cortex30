import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "../AuthForm";
import { login } from "../actions";

export const metadata: Metadata = { title: "Log in" };

// Static page (served from the CDN): the ?next= redirect target is read in the browser by AuthForm.
export default function LoginPage() {
  return (
    <Suspense>
      <AuthForm mode="login" action={login} />
    </Suspense>
  );
}
