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
import { Loader2, Mail, Lock, User } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const { register, isAuthenticated, isLoading } = useAuthStore();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !email.trim() || !password.trim()) {
      toast.error("Vui lòng điền đầy đủ thông tin", {
        description: "Tất cả các trường đều bắt buộc",
      });
      return;
    }

    if (username.trim().length < 3) {
      toast.error("Tên người dùng quá ngắn", {
        description: "Tên người dùng phải có ít nhất 3 ký tự",
      });
      return;
    }

    if (password.length < 6) {
      toast.error("Mật khẩu quá ngắn", {
        description: "Mật khẩu phải có ít nhất 6 ký tự",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp", {
        description: "Vui lòng nhập lại mật khẩu xác nhận",
      });
      return;
    }

    try {
      await register(username.trim(), email.trim(), password);
      
      // Get updated user info after registration
      const updatedUser = useAuthStore.getState().user;
      
      toast.success("Đăng ký thành công!", {
        description: updatedUser ? `Chào mừng ${updatedUser.username}! Đang chuyển hướng...` : "Đang chuyển hướng...",
        duration: 3000,
      });
      
      // Delay redirect to show notification
      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 500);
    } catch (error: any) {
      const errorMessage = error.message || "Đăng ký thất bại. Vui lòng thử lại.";
      
      // Handle specific error cases
      let description = "";
      if (errorMessage.includes("Email") && errorMessage.includes("already")) {
        description = "Email này đã được sử dụng. Vui lòng đăng nhập hoặc dùng email khác";
      } else if (errorMessage.includes("Username") && errorMessage.includes("already")) {
        description = "Tên người dùng này đã tồn tại. Vui lòng chọn tên khác";
      } else if (errorMessage.includes("password")) {
        description = "Mật khẩu không đủ mạnh. Vui lòng thử lại";
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
    <div className="flex min-h-[calc(100vh-4rem)] md:min-h-[calc(100vh-4rem)] items-center justify-center p-4 sm:p-6 md:p-8 pb-8 sm:pb-8">
        <div className="w-full max-w-md">
          <Card className="w-full">
            <CardHeader className="space-y-1 px-4 pt-6 sm:px-6">
              <CardTitle className="text-2xl font-bold">Đăng ký</CardTitle>
              <CardDescription className="text-sm">
                Tạo tài khoản mới để bắt đầu sử dụng dịch vụ
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-6 sm:px-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium">
                    Tên người dùng
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="username"
                      name="username"
                      type="text"
                      autoComplete="username"
                      autoCapitalize="none"
                      autoCorrect="off"
                      placeholder="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      disabled={isLoading}
                      className="pl-10 h-11 text-base"
                      required
                      minLength={3}
                    />
                  </div>
                </div>

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
                      autoComplete="new-password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      className="pl-10 h-11 text-base"
                      required
                      minLength={6}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Mật khẩu phải có ít nhất 6 ký tự
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium">
                    Xác nhận mật khẩu
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
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
                      Đang đăng ký...
                    </>
                  ) : (
                    "Đăng ký"
                  )}
                </Button>

                <div className="text-center text-sm text-muted-foreground pt-2">
                  Đã có tài khoản?{" "}
                  <Link
                    href="/login"
                    className="text-primary hover:underline font-medium"
                  >
                    Đăng nhập
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
  );
}

