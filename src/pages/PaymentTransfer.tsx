import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Copy, Upload, CheckCircle2, ChevronLeft, ShieldCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatVND } from "@/components/TourCard";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

const PaymentTransfer = () => {
  const { bookingId } = useParams();
  const [searchParams] = useSearchParams();
  const amount = searchParams.get("amount") || "0";
  const navigate = useNavigate();
  const { toast } = useToast();

  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { data: bookingsResponse } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: async () => {
      const res = await api.get('/bookings');
      return res.data;
    }
  });

  const booking = bookingsResponse?.data?.find((b: any) => b.booking_code === bookingId);
  const existingReceiptUrl = booking?.payment_receipt ? (booking.payment_receipt.startsWith('http') ? booking.payment_receipt : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000'}${booking.payment_receipt}`) : null;

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const accountInfo = {
    bank: "ViettelPay (MB Bank)",
    name: "NGUYỄN VĂN NGHĨA",
    number: "9704 2292 0577 1969 654",
    content: `Thanh toan don ${bookingId}`,
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Đã sao chép", description: `Đã sao chép ${label} vào clipboard.` });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast({ variant: "destructive", title: "File quá lớn", description: "Vui lòng chọn ảnh nhỏ hơn 5MB." });
        return;
      }
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      toast({ variant: "destructive", title: "Thiếu thông tin", description: "Vui lòng tải lên ảnh chụp màn hình (bill) chuyển khoản." });
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("receipt", file);

      const res = await api.post(`/bookings/${bookingId}/receipt`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        toast({ title: "Thành công", description: "Đã gửi hóa đơn thanh toán. Chúng tôi sẽ kiểm tra và xác nhận sớm nhất!" });
        navigate("/profile/orders");
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Lỗi", description: error.response?.data?.message || "Không thể gửi hóa đơn." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-secondary/30 py-10">
      <div className="container max-w-2xl">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ChevronLeft className="mr-2 h-4 w-4" /> Quay lại
        </Button>

        <div className="bg-card rounded-2xl shadow-soft overflow-hidden">
          <div className="bg-red-600 p-6 text-white text-center">
            <h1 className="font-display text-2xl font-bold">Thanh Toán Viettel Money</h1>
            <p className="text-white/80 mt-1">Quét mã QR hoặc chuyển khoản thủ công</p>
          </div>

          <div className="p-6 md:p-8 space-y-8">
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
              {/* QR Code */}
              <div className="w-48 shrink-0">
                <div className="aspect-square bg-white rounded-xl border border-border flex items-center justify-center p-3 relative overflow-hidden shadow-sm">
                   {/* In a real app, generate the VietQR image url here dynamically */}
                   <img src={`https://img.vietqr.io/image/MB-9704229205771969654-compact2.png?amount=${amount}&addInfo=${accountInfo.content}&accountName=${accountInfo.name}`} alt="QR Code" className="w-full h-full object-contain" />
                </div>
                <p className="text-center text-xs text-muted-foreground mt-2 font-medium">Mở App Ngân hàng hoặc Viettel Money để quét mã</p>
              </div>

              {/* Transfer Info */}
              <div className="flex-1 space-y-4 w-full">
                <div>
                  <div className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Ngân hàng thụ hưởng</div>
                  <div className="font-medium text-foreground">{accountInfo.bank}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Tên tài khoản</div>
                  <div className="font-medium text-foreground">{accountInfo.name}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Số tài khoản</div>
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-lg text-primary">{accountInfo.number}</span>
                    <button onClick={() => handleCopy(accountInfo.number, "Số tài khoản")} className="p-1.5 hover:bg-secondary rounded-md text-muted-foreground"><Copy className="h-4 w-4" /></button>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Số tiền chuyển</div>
                  <div className="font-display font-bold text-xl text-destructive">{formatVND(parseInt(amount))}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Nội dung chuyển khoản</div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono bg-secondary/50 px-2 py-1 rounded text-sm">{accountInfo.content}</span>
                    <button onClick={() => handleCopy(accountInfo.content, "Nội dung")} className="p-1.5 hover:bg-secondary rounded-md text-muted-foreground"><Copy className="h-4 w-4" /></button>
                  </div>
                  <p className="text-[10px] text-destructive mt-1 italic">* Vui lòng ghi chính xác nội dung này</p>
                </div>
              </div>
            </div>

            <hr className="border-border/50" />

            {/* Upload Receipt */}
            <div>
              <h3 className="font-display font-semibold flex items-center gap-2 mb-3">
                <CheckCircle2 className="h-5 w-5 text-success" /> Xác nhận đã chuyển khoản
              </h3>
              <p className="text-sm text-muted-foreground mb-4">Sau khi chuyển khoản thành công, vui lòng tải lên ảnh chụp màn hình (bill) để chúng tôi xác nhận giao dịch.</p>
              
              <label className="border-2 border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 transition-smooth rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer min-h-[160px]">
                {(previewUrl || existingReceiptUrl) ? (
                  <img src={previewUrl || existingReceiptUrl} alt="Receipt preview" className="max-h-[300px] rounded-lg shadow-sm object-contain" />
                ) : (
                  <>
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
                      <Upload className="h-6 w-6" />
                    </div>
                    <span className="font-medium text-primary">Tải lên ảnh Bill chuyển khoản</span>
                    <span className="text-xs text-muted-foreground mt-1">Hỗ trợ JPG, PNG (Tối đa 5MB)</span>
                  </>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </label>

              {(previewUrl || existingReceiptUrl) && (
                <div className="flex justify-center mt-3">
                  <span className="text-xs text-muted-foreground cursor-pointer hover:underline" onClick={() => { setFile(null); setPreviewUrl(null); }}>
                    {existingReceiptUrl && !previewUrl ? "Cập nhật ảnh khác" : "Chọn ảnh khác"}
                  </span>
                </div>
              )}
            </div>

            <Button variant="hero" size="lg" className="w-full" onClick={handleSubmit} disabled={isSubmitting || (!file && !existingReceiptUrl)}>
              {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ShieldCheck className="mr-2 h-5 w-5" />}
              {file ? "Gửi Xác Nhận Thanh Toán" : (existingReceiptUrl ? "Đã Gửi Hóa Đơn (Đang Chờ Duyệt)" : "Gửi Xác Nhận Thanh Toán")}
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default PaymentTransfer;
