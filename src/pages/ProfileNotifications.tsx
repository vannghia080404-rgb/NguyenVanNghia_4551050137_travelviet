import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProfileLayout from "@/components/layout/ProfileLayout";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

const ProfileNotifications = () => {
  const queryClient = useQueryClient();

  const { data: response, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => api.get("/notifications").then((r) => r.data),
  });

  const notifications = response?.data || [];

  const markAsRead = useMutation({
    mutationFn: (id: string) => api.put(`/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-unread"] });
    },
  });

  const markAllAsRead = useMutation({
    mutationFn: () => api.put("/notifications/read-all"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-unread"] });
    },
  });

  return (
    <ProfileLayout title="Cài đặt thông báo">
      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 min-h-[500px]">
        <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
          <h2 className="font-display text-xl font-bold text-gray-900">Thông báo của bạn</h2>
          {notifications.some((n: any) => !n.read_at) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAllAsRead.mutate()}
              disabled={markAllAsRead.isPending}
            >
              {markAllAsRead.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
              Đánh dấu tất cả đã đọc
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16">
            <div className="h-20 w-20 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4">
              <Bell className="h-8 w-8 text-gray-300" />
            </div>
            <h3 className="font-semibold text-gray-900">Chưa có thông báo nào</h3>
            <p className="text-gray-500 text-sm mt-1">Khi có thông báo mới, chúng sẽ xuất hiện tại đây.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif: any) => (
              <div
                key={notif.id}
                className={cn(
                  "p-4 rounded-xl border transition-colors flex gap-4",
                  notif.read_at ? "bg-white border-gray-100" : "bg-primary/5 border-primary/20"
                )}
                onClick={() => {
                  if (!notif.read_at) markAsRead.mutate(notif.id);
                }}
              >
                <div className="h-10 w-10 shrink-0 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center text-primary">
                  <Bell className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h4 className={cn("text-sm mb-1", notif.read_at ? "font-medium text-gray-900" : "font-bold text-primary")}>
                    {notif.data?.title || "Thông báo hệ thống"}
                  </h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {notif.data?.message || JSON.stringify(notif.data)}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: vi })}
                  </p>
                </div>
                {!notif.read_at && (
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0"></div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </ProfileLayout>
  );
};

export default ProfileNotifications;
