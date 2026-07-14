import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const registering = mode === "register";

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle><h1>{registering ? "Create your candidate account" : "Welcome back"}</h1></CardTitle>
        <CardDescription><p>{registering ? "Start building a verified profile and discover relevant roles." : "Log in to continue your CareerOS journey."}</p></CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {registering && (
          <div className="space-y-2">
            <label htmlFor="name"><p>Full name</p></label>
            <Input id="name" name="name" />
          </div>
        )}
        <div className="space-y-2">
          <label htmlFor="email"><p>Email</p></label>
          <Input id="email" name="email" type="email" />
        </div>
        <div className="space-y-2">
          <label htmlFor="password"><p>Password</p></label>
          <Input id="password" name="password" type="password" />
        </div>
        {registering && (
          <div className="space-y-2">
            <label htmlFor="goal"><p>Current career goal</p></label>
            <Input id="goal" name="goal" placeholder="e.g. Find my first product role" />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col items-stretch gap-3">
        <Button asChild><Link href={registering ? "/candidate/onboarding" : "/candidate/dashboard"}>{registering ? "Create account and continue" : "Log in"}</Link></Button>
        <Button asChild variant="outline"><Link href={registering ? "/login" : "/register"}>{registering ? "Already registered? Log in" : "New to CareerOS? Register"}</Link></Button>
        <Button asChild variant="ghost"><Link href="/">Back to home</Link></Button>
      </CardFooter>
    </Card>
  );
}