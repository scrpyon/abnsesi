"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(72),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm({
  callbackUrl,
  initialError,
}: {
  callbackUrl: string;
  initialError?: string;
}) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: LoginValues) => {
    const res = await signIn("credentials", {
      ...values,
      redirect: false,
      redirectTo: callbackUrl,
    });

    if (!res || res.error) {
      setError("root", { message: "Email atau password tidak valid." });
      return;
    }

    router.push(res.url ?? callbackUrl);
    router.refresh();
  };

  return (
    <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
      {initialError ? (
        <p className="text-sm text-destructive">{initialError}</p>
      ) : null}
      {errors.root?.message ? (
        <p className="text-sm text-destructive">{errors.root.message}</p>
      ) : null}

      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" autoComplete="email" {...register("email")} />
        {errors.email?.message ? (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        ) : null}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          {...register("password")}
        />
        {errors.password?.message ? (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        ) : null}
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Memproses..." : "Login"}
      </Button>
    </form>
  );
}

