"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  Plus,
  Edit2,
  Trash2,
  Loader2,
  FileText,
  Calendar,
  Search,
  Eye,
  Code,
  X,
  Maximize2,
  Copy,
  Check,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuthStore } from "@/store/auth";

// Fallback image URL for posts without cover image
// You can set NEXT_PUBLIC_FALLBACK_POST_IMAGE in .env.local to use your own demo image
const FALLBACK_POST_IMAGE = process.env.NEXT_PUBLIC_FALLBACK_POST_IMAGE || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=400&h=300&fit=crop&q=80";

interface Post {
  id: number;
  title: string;
  content: string;
  cover_url?: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function PostsPage() {
  const router = useRouter();
  const { token, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchPosts();
    }
  }, [isAuthenticated, token]);

  const fetchPosts = async () => {
    if (!token) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/posts", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Failed to fetch posts");
      }

      const result = await response.json();
      if (result.ok && result.data?.posts) {
        setPosts(result.data.posts);
      }
    } catch (error: any) {
      toast.error(`Lỗi khi tải bài viết: ${error.message || "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setFormTitle("");
    setFormContent("");
    setSelectedPost(null);
    setCreateDialogOpen(true);
  };

  // Helper function to parse and clean HTML content for preview
  const parseContentForPreview = (html: string): string => {
    if (!html) return "";
    
    // Parse Gutenberg Block HTML or regular HTML
    let parsed = html
      // Remove Gutenberg block comments (<!-- wp:block --> and <!-- /wp:block -->)
      .replace(/<!--\s*\/?wp:[^>]*-->/g, "")
      // Remove block delimiters and attributes
      .replace(/<!--\s*wp:[^>]*-->/g, "")
      // Clean up extra whitespace between blocks
      .replace(/\n\s*\n\s*\n+/g, "\n\n")
      // Remove empty paragraphs
      .replace(/<p>\s*<\/p>/g, "")
      // Add spacing between block elements
      .replace(/(<\/h[1-6]>)/g, "$1\n")
      .replace(/(<\/p>)/g, "$1\n")
      .replace(/(<\/ul>)/g, "$1\n")
      .replace(/(<\/ol>)/g, "$1\n")
      .replace(/(<\/blockquote>)/g, "$1\n")
      // Clean up final whitespace
      .trim();
    
    return parsed;
  };

  const handleEdit = (post: Post) => {
    setSelectedPost(post);
    setFormTitle(post.title);
    setFormContent(post.content);
    setIsPreviewMode(false);
    setCopied(false);
    setEditDialogOpen(true);
  };

  const handleCopyContent = async () => {
    try {
      await navigator.clipboard.writeText(formContent);
      setCopied(true);
      toast.success("Đã copy nội dung!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Không thể copy nội dung");
    }
  };

  const handleCopyHTML = async () => {
    try {
      const html = parseContentForPreview(formContent);
      await navigator.clipboard.writeText(html);
      toast.success("Đã copy HTML!");
    } catch (error) {
      toast.error("Không thể copy HTML");
    }
  };

  const handleCopyPlainText = async () => {
    try {
      const plainText = parseContentForPreview(formContent)
        .replace(/<[^>]*>/g, "")
        .replace(/\s+/g, " ")
        .trim();
      await navigator.clipboard.writeText(plainText);
      toast.success("Đã copy text!");
    } catch (error) {
      toast.error("Không thể copy text");
    }
  };

  const handleDelete = (post: Post) => {
    setSelectedPost(post);
    setDeleteDialogOpen(true);
  };

  const handleCreateSubmit = async () => {
    if (!formTitle.trim() || !formContent.trim()) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    if (!token) {
      toast.error("Vui lòng đăng nhập");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formTitle.trim(),
          content: formContent.trim(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Failed to create post");
      }

      const result = await response.json();
      if (result.ok) {
        toast.success("Tạo bài viết thành công!");
        setCreateDialogOpen(false);
        setFormTitle("");
        setFormContent("");
        fetchPosts();
      }
    } catch (error: any) {
      toast.error(`Lỗi khi tạo bài viết: ${error.message || "Unknown error"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async () => {
    if (!selectedPost || !formTitle.trim() || !formContent.trim()) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    if (!token) {
      toast.error("Vui lòng đăng nhập");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/posts/${selectedPost.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formTitle.trim(),
          content: formContent.trim(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Failed to update post");
      }

      const result = await response.json();
      if (result.ok) {
        toast.success("Cập nhật bài viết thành công!");
        setEditDialogOpen(false);
        setSelectedPost(null);
        setFormTitle("");
        setFormContent("");
        fetchPosts();
      }
    } catch (error: any) {
      toast.error(`Lỗi khi cập nhật bài viết: ${error.message || "Unknown error"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedPost || !token) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/posts/${selectedPost.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Failed to delete post");
      }

      const result = await response.json();
      if (result.ok) {
        toast.success("Xóa bài viết thành công!");
        setDeleteDialogOpen(false);
        setSelectedPost(null);
        fetchPosts();
      }
    } catch (error: any) {
      toast.error(`Lỗi khi xóa bài viết: ${error.message || "Unknown error"}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter posts by search query
  const filteredPosts = posts.filter((post) =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPosts = filteredPosts.slice(startIndex, endIndex);

  // Reset to page 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  if (authLoading || !isAuthenticated) {
    return (
      <AppShell>
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="container mx-auto max-w-7xl px-4 py-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Quản lý bài viết</h1>
            <p className="text-muted-foreground mt-2">
              Quản lý các bài viết của bạn
            </p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Tạo bài viết mới
          </Button>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm bài viết..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Posts List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredPosts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchQuery ? "Không tìm thấy bài viết" : "Chưa có bài viết nào"}
              </p>
              {!searchQuery && (
                <Button onClick={handleCreate} className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Tạo bài viết đầu tiên
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {paginatedPosts.map((post) => {
              const plainTextContent = post.content.replace(/<[^>]*>/g, "").substring(0, 150);
              
              return (
                <Card key={post.id} className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Cover Image */}
                  <div className="relative w-full h-48 bg-muted overflow-hidden">
                    <img
                      src={post.cover_url || FALLBACK_POST_IMAGE}
                      alt={post.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to demo image if image fails to load
                        const target = e.target as HTMLImageElement;
                        if (target.src !== FALLBACK_POST_IMAGE) {
                          target.src = FALLBACK_POST_IMAGE;
                        } else {
                          // If fallback also fails, show placeholder
                          target.style.display = "none";
                          if (target.parentElement) {
                            target.parentElement.innerHTML = `
                              <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                                <svg class="h-12 w-12 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            `;
                          }
                        }
                      }}
                    />
                  </div>
                  
                  <CardHeader>
                    <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      {new Date(post.createdAt).toLocaleDateString("vi-VN")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                      {plainTextContent}
                      {plainTextContent.length >= 150 ? "..." : ""}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleEdit(post)}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <Edit2 className="mr-2 h-4 w-4" />
                        Sửa
                      </Button>
                      <Button
                        onClick={() => handleDelete(post)}
                        variant="outline"
                        size="sm"
                        className="flex-1 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Xóa
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Trước
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    // Show first page, last page, current page, and pages around current
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className="min-w-[40px]"
                        >
                          {page}
                        </Button>
                      );
                    } else if (
                      page === currentPage - 2 ||
                      page === currentPage + 2
                    ) {
                      return (
                        <span key={page} className="px-2 text-muted-foreground">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Sau
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Pagination Info */}
            {filteredPosts.length > 0 && (
              <div className="text-center text-sm text-muted-foreground mt-4">
                Hiển thị {startIndex + 1} - {Math.min(endIndex, filteredPosts.length)} trong tổng số {filteredPosts.length} bài viết
              </div>
            )}
          </>
        )}

        {/* Create Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Tạo bài viết mới</DialogTitle>
              <DialogDescription>
                Tạo bài viết mới với title và content
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="createTitle">Title *</Label>
                <Input
                  id="createTitle"
                  placeholder="Nhập tiêu đề..."
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="createContent">Content *</Label>
                <Textarea
                  id="createContent"
                  placeholder="Nhập nội dung..."
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  disabled={isSubmitting}
                  rows={10}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Hỗ trợ HTML và Gutenberg Block HTML
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={() => setCreateDialogOpen(false)}
                variant="outline"
                disabled={isSubmitting}
              >
                Hủy
              </Button>
              <Button onClick={handleCreateSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Tạo
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog - Fullscreen */}
        <Dialog open={editDialogOpen} onOpenChange={(open) => {
          if (!open && !isSubmitting) {
            setEditDialogOpen(false);
            setIsPreviewMode(false);
          }
        }}>
          <DialogContent 
            className="!fixed !inset-0 !z-50 !w-screen !h-screen !max-w-none !max-h-none !m-0 !p-0 !rounded-none !translate-x-0 !translate-y-0 !left-0 !top-0 flex flex-col gap-0 border-0 shadow-none"
            hideCloseButton={true}
            onPointerDownOutside={(e) => {
              if (!isSubmitting) {
                e.preventDefault();
              }
            }}
            onEscapeKeyDown={(e) => {
              if (!isSubmitting) {
                setEditDialogOpen(false);
                setIsPreviewMode(false);
              } else {
                e.preventDefault();
              }
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b px-6 py-4 shrink-0 bg-background">
              <div className="flex items-center gap-4">
                <DialogTitle className="text-xl font-semibold m-0">Chỉnh sửa bài viết</DialogTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant={!isPreviewMode ? "default" : "outline"}
                    size="sm"
                    onClick={() => setIsPreviewMode(false)}
                    className="h-8"
                  >
                    <Code className="mr-2 h-4 w-4" />
                    Code
                  </Button>
                  <Button
                    variant={isPreviewMode ? "default" : "outline"}
                    size="sm"
                    onClick={() => setIsPreviewMode(true)}
                    className="h-8"
                    disabled={!formContent}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </Button>
                  {isPreviewMode && formContent && (
                    <div className="flex items-center gap-2 ml-2 pl-2 border-l">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyContent}
                        className="h-8"
                        disabled={!formContent}
                      >
                        {copied ? (
                          <>
                            <Check className="mr-2 h-4 w-4" />
                            Đã copy
                          </>
                        ) : (
                          <>
                            <Copy className="mr-2 h-4 w-4" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setEditDialogOpen(false);
                  setIsPreviewMode(false);
                  setCopied(false);
                }}
                className="h-8 w-8"
                disabled={isSubmitting}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden flex flex-col min-h-0">
              {isPreviewMode ? (
                // Preview Mode
                <div className="flex-1 overflow-y-auto p-6 bg-background">
                  <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b">
                      <h1 className="text-3xl font-bold">{formTitle || "Untitled"}</h1>
                      {formContent && (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCopyHTML}
                            className="h-8"
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            Copy HTML
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCopyPlainText}
                            className="h-8"
                          >
                            <FileText className="mr-2 h-4 w-4" />
                            Copy Text
                          </Button>
                        </div>
                      )}
                    </div>
                    {formContent ? (
                      <div
                        className="gutenberg-content space-y-4
                          [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mt-8 [&_h1]:mb-4 [&_h1]:text-foreground
                          [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:text-foreground
                          [&_h3]:text-xl [&_h3]:font-bold [&_h3]:mt-4 [&_h3]:mb-2 [&_h3]:text-foreground
                          [&_h4]:text-lg [&_h4]:font-bold [&_h4]:mt-3 [&_h4]:mb-2 [&_h4]:text-foreground
                          [&_h5]:text-base [&_h5]:font-bold [&_h5]:mt-2 [&_h5]:mb-2 [&_h5]:text-foreground
                          [&_h6]:text-sm [&_h6]:font-bold [&_h6]:mt-2 [&_h6]:mb-2 [&_h6]:text-foreground
                          [&_p]:mb-4 [&_p]:leading-relaxed [&_p]:text-base [&_p]:text-foreground
                          [&_ul]:list-disc [&_ul]:list-inside [&_ul]:space-y-2 [&_ul]:ml-4 [&_ul]:mb-4 [&_ul]:text-foreground
                          [&_ol]:list-decimal [&_ol]:list-inside [&_ol]:space-y-2 [&_ol]:ml-4 [&_ol]:mb-4 [&_ol]:text-foreground
                          [&_li]:mb-1 [&_li]:text-foreground
                          [&_img]:rounded-lg [&_img]:max-w-full [&_img]:h-auto [&_img]:my-4 [&_img]:shadow-md
                          [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:pr-4 [&_blockquote]:py-2 [&_blockquote]:italic [&_blockquote]:my-4 [&_blockquote]:text-muted-foreground [&_blockquote]:bg-muted/50 [&_blockquote]:rounded-r
                          [&_a]:text-primary [&_a]:underline [&_a]:hover:text-primary/80 [&_a]:font-medium
                          [&_code]:bg-muted [&_code]:px-2 [&_code]:py-1 [&_code]:rounded [&_code]:font-mono [&_code]:text-sm [&_code]:text-foreground
                          [&_pre]:bg-muted [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_pre]:font-mono [&_pre]:text-sm [&_pre]:my-4 [&_pre]:border
                          [&_table]:w-full [&_table]:border-collapse [&_table]:my-4 [&_table]:border
                          [&_table_thead]:bg-muted
                          [&_table_th]:border [&_table_th]:p-3 [&_table_th]:text-left [&_table_th]:font-semibold
                          [&_table_td]:border [&_table_td]:p-3
                          [&_hr]:my-6 [&_hr]:border-t [&_hr]:border-border
                          [&_strong]:font-bold [&_strong]:text-foreground
                          [&_em]:italic [&_em]:text-foreground
                          [&_del]:line-through [&_del]:text-muted-foreground"
                        dangerouslySetInnerHTML={{ __html: parseContentForPreview(formContent) }}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                        <Eye className="h-12 w-12 mb-4 opacity-50" />
                        <p>Nhập nội dung và click "Preview" để xem trực quan</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                // Edit Mode
                <div className="flex-1 overflow-y-auto p-6 bg-background">
                  <div className="max-w-4xl mx-auto space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="editTitle" className="text-base font-medium">Title *</Label>
                      <Input
                        id="editTitle"
                        placeholder="Nhập tiêu đề..."
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        disabled={isSubmitting}
                        className="text-lg h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="editContent" className="text-base font-medium">Content *</Label>
                      <Textarea
                        id="editContent"
                        placeholder="Nhập nội dung (HTML hoặc Gutenberg Block HTML)..."
                        value={formContent}
                        onChange={(e) => setFormContent(e.target.value)}
                        disabled={isSubmitting}
                        rows={25}
                        className="font-mono text-sm min-h-[600px] resize-none"
                      />
                      <p className="text-xs text-muted-foreground">
                        Hỗ trợ HTML và Gutenberg Block HTML. Sử dụng nút "Preview" để xem trực quan.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t px-6 py-4 shrink-0 bg-background">
              <Button
                onClick={() => {
                  setEditDialogOpen(false);
                  setIsPreviewMode(false);
                  setCopied(false);
                }}
                variant="outline"
                disabled={isSubmitting}
              >
                Hủy
              </Button>
              <div className="flex items-center gap-2">
                {!isPreviewMode && (
                  <Button
                    onClick={() => setIsPreviewMode(true)}
                    variant="outline"
                    disabled={isSubmitting || !formContent}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Xem trước
                  </Button>
                )}
                {isPreviewMode && (
                  <Button
                    onClick={() => setIsPreviewMode(false)}
                    variant="outline"
                    disabled={isSubmitting}
                  >
                    <Code className="mr-2 h-4 w-4" />
                    Quay lại chỉnh sửa
                  </Button>
                )}
                <Button onClick={handleEditSubmit} disabled={isSubmitting || !formTitle || !formContent}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang cập nhật...
                    </>
                  ) : (
                    <>
                      <Edit2 className="mr-2 h-4 w-4" />
                      Cập nhật
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
              <AlertDialogDescription>
                Bạn có chắc chắn muốn xóa bài viết &quot;{selectedPost?.title}&quot;? Hành động này không thể hoàn tác.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang xóa...
                  </>
                ) : (
                  "Xóa"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppShell>
  );
}

