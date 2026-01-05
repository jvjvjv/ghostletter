"use client";

import { useRouter } from "next/navigation";
import React from "react";

import Avatar from "@/components/Avatar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { logoutThunk } from "@/store/authSlice";

export default function SettingsView() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.authenticatedUser);

  const handleLogout = async () => {
    await dispatch(logoutThunk());
    router.push("/signin");
  };

  if (!currentUser) {
    return (
      <div className="flex h-screen items-center justify-center">
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-white">
      <header className="border-b border-gray-200 bg-white p-4">
        <h1 className="text-center text-xl font-semibold">Settings</h1>
      </header>
      <main className="flex flex-1 flex-col items-center overflow-y-auto p-4">
        <Avatar friend={currentUser} size={12} />
        <div className="mt-4 w-full max-w-sm space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" type="text" value={currentUser.name} readOnly />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" type="text" value={currentUser.username} readOnly />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={currentUser.email} readOnly />
          </div>
        </div>
        <Button onClick={handleLogout} className="mt-8">
          Log Out
        </Button>
      </main>
    </div>
  );
}
