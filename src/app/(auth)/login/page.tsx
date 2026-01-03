import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { sizesImage } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { ClientLogin } from "./_components/client";
import { Metadata } from "next";
// import { auth } from "@/lib/action/auth";
// import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Login",
};

const LoginPage = async () => {
  // const isAuth = await auth();
  // if (isAuth) redirect("/?fromUrl=login");

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 relative">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <Link href="/" className="aspect-4/1 w-1/3 relative mx-6">
              <Image
                src={"/assets/images/logo-bulky.png"}
                sizes={sizesImage}
                alt="bulky logo"
                className="object-contain"
                fill
              />
            </Link>
            <CardHeader>
              <CardTitle>Login to your account</CardTitle>
              <CardDescription>
                Enter your email below to login to your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ClientLogin />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
