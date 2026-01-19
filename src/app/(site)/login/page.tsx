"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/store/auth";
import { toast } from "sonner";
import { Loader2, Mail, Lock } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading, user } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      toast.error("Vui lòng điền đầy đủ thông tin", {
        description: "Email và mật khẩu không được để trống",
      });
      return;
    }

    try {
      await login(email.trim(), password);
      
      // Get updated user info after login
      const updatedUser = useAuthStore.getState().user;
      
      toast.success("Đăng nhập thành công!", {
        description: updatedUser ? `Chào mừng trở lại, ${updatedUser.username}!` : "Đang chuyển hướng...",
        duration: 3000,
      });
      
      // Delay redirect to show notification
      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 500);
    } catch (error: any) {
      const errorMessage = error.message || "Đăng nhập thất bại. Vui lòng thử lại.";
      
      // Handle specific error cases
      let description = "";
      if (errorMessage.includes("Invalid identifier") || errorMessage.includes("Invalid credentials")) {
        description = "Email hoặc mật khẩu không chính xác";
      } else if (errorMessage.includes("blocked")) {
        description = "Tài khoản của bạn đã bị khóa";
      } else if (errorMessage.includes("confirmed")) {
        description = "Vui lòng xác nhận email trước khi đăng nhập";
      } else {
        description = "Vui lòng kiểm tra lại thông tin và thử lại";
      }
      
      toast.error(errorMessage, {
        description,
        duration: 4000,
      });
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] md:min-h-[calc(100vh-4rem)] items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-md">
          <Card className="w-full">
            <CardHeader className="space-y-1 px-4 pt-6 sm:px-6">
              <CardTitle className="text-2xl font-bold">Đăng nhập</CardTitle>
              <CardDescription className="text-sm">
                Nhập email và mật khẩu để đăng nhập vào tài khoản của bạn
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-6 sm:px-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      autoCapitalize="none"
                      autoCorrect="off"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      className="pl-10 h-11 text-base"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Mật khẩu
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      className="pl-10 h-11 text-base"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 text-base font-medium"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang đăng nhập...
                    </>
                  ) : (
                    "Đăng nhập"
                  )}
                </Button>

                <div className="text-center text-sm text-muted-foreground pt-2">
                  Chưa có tài khoản?{" "}
                  <Link
                    href="/signup"
                    className="text-primary hover:underline font-medium"
                  >
                    Đăng ký ngay
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
  );
}

