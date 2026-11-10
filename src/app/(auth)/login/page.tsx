import type { Metadata } from "next";
import { AuthForm } from "../AuthForm";
import { login } from "../actions";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next } = await searchParams;
  return <AuthForm mode="login" action={login} next={typeof next === "string" ? next : undefined} />;
}
