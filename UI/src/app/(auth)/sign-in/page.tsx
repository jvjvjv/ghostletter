"use client";

import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import * as z from "zod";

import type { GhostFormResponse } from "@/components/GhostForm/GhostForm";

import { login } from "@/clientApi/auth";
import GhostForm from "@/components/GhostForm/GhostForm";
import store from "@/store";
import { setUser } from "@/store/authSlice";

const signInSchema = z.object({
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

const SignIn = () => {
  const handleSignIn = async (
    previousData: GhostFormResponse,
    form: FormData,
  ): Promise<GhostFormResponse> => {
    const username = form.get("username");
    const password = form.get("password");

    // Validate with Zod
    const validation = signInSchema.safeParse({ username, password });
    if (!validation.success) {
      const errors: { [key: string]: string } = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) {
          errors[err.path[0].toString()] = err.message;
        }
      });
      return {
        success: false,
        message: "Please fix the errors below",
        errors,
        fields: { username, password },
      };
    }

    // Call real API login with username
    const result = await login(username as string, password as string);

    if (result.success && result.user) {
      // Store user in Redux (token is already stored in cookie by login function)
      store.dispatch(setUser({ user: result.user }));
      redirect("/main/camera");
    }

    return {
      success: false,
      message: result.message || "Invalid credentials",
      errors: { username: result.message || "Invalid credentials" },
      fields: { username, password },
    };
  };

  return (
    <main className="page page-center">
      <div className="mb-2 flex h-80 w-80 items-center justify-center self-center rounded-full text-center">
        <Image priority src="/ghostletter-circle.svg" width={320} height={320} alt="Ghostletter: Send your pictures!" />
      </div>
      <h1 className="font-bold">Sign In</h1>
      <GhostForm
        action={handleSignIn}
        submitText="Sign In"
        fields={[
          {
            type: "text",
            name: "username",
            placeholder: "username",
            autoComplete: "username",
            defaultValue: "",
            required: true,
          },
          {
            type: "password",
            name: "password",
            placeholder: "Password",
            autoComplete: "current-password",
            required: true,
          },
        ]}
      />
      <p className="absolute bottom-5 w-full text-center text-xs">
        <Link href="/terms">Terms of Service</Link> | <Link href="/privacy">Privacy Policy</Link>
      </p>
    </main>
  );
};

export default SignIn;
