import React, { useState } from "react";
import { MessageSquare, Star, Reply, Send, Loader2, Calendar, User, MapPin } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { reviewAPIs } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const AdminReviews = () => {
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [editCommentText, setEditCommentText] = useState("");
  const queryClient = useQueryClient();

  const { data: response, isLoading } = useQuery({
    queryKey: ["admin-reviews"],
    queryFn: async () => {
      const res = await reviewAPIs.adminList();
      console.log("AdminReviews API response:", res.data);
      return res.data;
    },
  });

  const replyMutation = useMutation({
    mutationFn: ({ id, reply }: { id: number; reply: string }) =>
      reviewAPIs.reply(id, reply),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      toast({ title: "Thành công", description: "Đã phản hồi đánh giá" });
      setReplyingTo(null);
      setReplyText("");
    },
  });

  const editReviewMutation = useMutation({
    mutationFn: ({ id, comment }: { id: number; comment: string }) =>
      reviewAPIs.update(id, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      toast({ title: "Thành công", description: "Đã cập nhật nội dung đánh giá" });
      setEditingReviewId(null);
      setEditCommentText("");
    },
  });

  const approveMutation = useMutation({
    mutationFn: (id: number) => reviewAPIs.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      toast({ title: "Thành công", description: "Đã duyệt đánh giá" });
    },
  });

  const reviews = Array.isArray(response?.data?.data)
    ? response.data.data
    : Array.isArray(response?.data)
    ? response.data
    : [];

  return (
    <AdminLayout title="Quản lý Đánh giá">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">Phản hồi các đánh giá từ khách hàng để tăng uy tín cho thương hiệu.</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-6">
            {reviews.map((review: any) => (
              <div key={review.id} className="bg-card border border-border/50 rounded-2xl shadow-soft overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-full gradient-primary flex items-center justify-center text-lg font-bold text-white shrink-0">
                        {review.user?.name?.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-foreground text-lg">{review.user?.name}</h3>
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }, (_, i) => (
                              <Star key={i} className={cn("h-4 w-4", i < review.rating ? "fill-accent text-accent" : "text-border")} />
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {review.tour?.name}</span>
                          <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {new Date(review.created_at).toLocaleDateString("vi-VN")}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {editingReviewId === review.id ? (
                    <div className="mt-4 space-y-3">
                      <Textarea 
                        value={editCommentText}
                        onChange={(e) => setEditCommentText(e.target.value)}
                        className="bg-background min-h-[80px]"
                      />
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => setEditingReviewId(null)}>Hủy</Button>
                        <Button size="sm" onClick={() => editReviewMutation.mutate({ id: review.id, comment: editCommentText })} disabled={editReviewMutation.isPending}>
                          {editReviewMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Lưu thay đổi"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 bg-secondary/20 p-4 rounded-xl italic text-muted-foreground group relative">
                      "{review.comment}"
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-7 text-xs"
                        onClick={() => {
                          setEditingReviewId(review.id);
                          setEditCommentText(review.comment);
                        }}
                      >
                        Sửa đánh giá
                      </Button>
                    </div>
                  )}

                  {review.admin_reply ? (
                    <div className="mt-4 ml-8 p-4 rounded-xl bg-primary/5 border-l-4 border-primary/40">
                      <div className="flex items-center gap-2 mb-2">
                        <Reply className="h-4 w-4 text-primary" />
                        <span className="text-sm font-bold text-foreground">Bạn đã phản hồi:</span>
                        <span className="text-xs text-muted-foreground">{new Date(review.replied_at).toLocaleDateString("vi-VN")}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{review.admin_reply}</p>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="mt-2 text-primary h-8"
                        onClick={() => {
                          setReplyingTo(review.id);
                          setReplyText(review.admin_reply);
                        }}
                      >
                        Sửa phản hồi
                      </Button>
                    </div>
                  ) : replyingTo !== review.id ? (
                    <div className="mt-4 flex justify-end gap-2">
                      {!review.is_approved && (
                        <Button
                          variant="default"
                          className="gap-2 bg-success text-white hover:bg-success/90"
                          onClick={() => approveMutation.mutate(review.id)}
                          disabled={approveMutation.isPending}
                        >
                          Duyệt
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        className="gap-2"
                        onClick={() => setReplyingTo(review.id)}
                      >
                        <Reply className="h-4 w-4" /> Viết phản hồi
                      </Button>
                    </div>
                  ) : null}

                  {replyingTo === review.id && (
                    <div className="mt-6 space-y-4 animate-in slide-in-from-top-4 duration-300">
                      <div className="flex items-center gap-2 text-sm font-bold text-foreground mb-2">
                        <MessageSquare className="h-4 w-4 text-primary" />
                        Nội dung phản hồi từ Admin
                      </div>
                      <Textarea
                        placeholder="Cảm ơn khách hàng và phản hồi các thắc mắc..."
                        className="min-h-[120px] bg-background"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                      />
                      <div className="flex justify-end gap-3">
                        <Button variant="ghost" onClick={() => setReplyingTo(null)}>Hủy bỏ</Button>
                        <Button 
                          className="gap-2" 
                          disabled={!replyText || replyMutation.isPending}
                          onClick={() => replyMutation.mutate({ id: review.id, reply: replyText })}
                        >
                          {replyMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                          Gửi phản hồi
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {reviews.length === 0 && (
              <div className="text-center py-20 bg-card border border-dashed border-border rounded-2xl">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                <h3 className="text-lg font-medium text-foreground">Chưa có đánh giá nào</h3>
                <p className="text-muted-foreground">Tất cả đánh giá từ khách hàng sẽ xuất hiện tại đây.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminReviews;
