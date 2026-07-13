"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const registering = mode === "register";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push(registering ? "/candidate/onboarding" : "/candidate/dashboard");
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle><h1>{registering ? "Create your candidate account" : "Welcome back"}</h1></CardTitle>
        <CardDescription><p>{registering ? "Start building a verified profile and discover relevant roles." : "Log in to continue your CareerOS journey."}</p></CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {registering && <div className="space-y-2"><label htmlFor="name"><p>Full name</p></label><Input id="name" name="name" autoComplete="name" required /></div>}
          <div className="space-y-2"><label htmlFor="email"><p>Email</p></label><Input id="email" name="email" type="email" autoComplete="email" required /></div>
          <div className="space-y-2"><label htmlFor="password"><p>Password</p></label><Input id="password" name="password" type="password" autoComplete={registering ? "new-password" : "current-password"} required /></div>
          {registering && <div className="space-y-2"><label htmlFor="goal"><p>Current career goal</p></label><Input id="goal" name="goal" placeholder="e.g. Find my first product role" required /></div>}
        </CardContent>
        <CardFooter className="flex flex-col items-stretch gap-3">
          <Button type="submit">{registering ? "Create account and continue" : "Log in"}</Button>
          <Button asChild variant="outline"><Link href={registering ? "/login" : "/register"}>{registering ? "Already registered? Log in" : "New to CareerOS? Register"}</Link></Button>
          <Button asChild variant="ghost"><Link href="/">Back to home</Link></Button>
        </CardFooter>
      </form>
    </Card>
  );
}
