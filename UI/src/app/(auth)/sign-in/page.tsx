"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";

import type { GhostFormResponse } from "@/components/GhostForm/GhostForm";
import GhostForm from "@/components/GhostForm/GhostForm";
import store from "@/store";
import { setUser } from "@/store/authSlice";
import { selectUserByUsername } from "@/store/usersSlice";
import { authenticate } from "@/clientApi/auth";

const SignIn = () => {
  const handleSignIn = async (previousData: GhostFormResponse, form: FormData): Promise<GhostFormResponse> => {
    // TODO: This should use Server Actions and Redux
    const username = form.get("username");
    const password = form.get("password");

    const response: GhostFormResponse = await authenticate(username as string, password as string);
    if (response.success) {
      const user = selectUserByUsername(store.getState(), username as string);
      if (!user) {
        return {
          success: false,
          message: "User not found",
          errors: { username: "User not found" },
        };
      }
      store.dispatch(setUser(user));
      redirect("/main/camera");
    }
    return response;
  };

  return (
    <main className="page page-center">
      <div className="mb-8 flex h-80 w-80 items-center justify-center self-center rounded-full text-center">
        <Image priority src="/ghostletter.svg" width={320} height={320} alt="Ghostletter: Send your pictures!" />
      </div>
      <h1 className="font-bold">Sign In</h1>
      <GhostForm
        action={handleSignIn}
        submitText="Sign In"
        fields={[
          {
            type: "text",
            name: "username",
            placeholder: "demo01",
            autoComplete: "username",
            defaultValue: "demo01",
            required: true,
          },
          {
            type: "password",
            name: "password",
            placeholder: "demo01",
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
