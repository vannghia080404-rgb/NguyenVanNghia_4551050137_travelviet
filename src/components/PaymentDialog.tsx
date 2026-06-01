import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Check, Wallet, Smartphone, ShieldCheck, Building2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import paymentQR from "@/assets/payment-qr.jpg";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number;
  tourName: string;
}

const wallets = [
  { id: "viettelpay", name: "Viettel Money", color: "bg-red-500", short: "VTM" },
  { id: "momo", name: "MoMo", color: "bg-pink-500", short: "MoMo" },
  { id: "zalopay", name: "ZaloPay", color: "bg-blue-500", short: "ZP" },
  { id: "vnpay", name: "VNPay", color: "bg-sky-600", short: "VNP" },
];

const formatVND = (n: number) => new Intl.NumberFormat("vi-VN").format(n) + "đ";

const PaymentDialog = ({ open, onOpenChange, amount, tourName }: PaymentDialogProps) => {
  const [selected, setSelected] = useState("viettelpay");
  const [copied, setCopied] = useState(false);
  const accountNumber = "9704 2292 0577 1969 654";

  const handleCopy = () => {
    navigator.clipboard.writeText(accountNumber.replace(/\s/g, ""));
    setCopied(true);
    toast({ title: "Đã sao chép", description: "Số tài khoản đã copy vào clipboard." });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirm = () => {
    toast({
      title: "Đã ghi nhận thanh toán",
      description: "Chúng tôi sẽ xác nhận đơn hàng trong vòng 5 phút.",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border bg-secondary/40">
          <DialogTitle className="font-display text-2xl flex items-center gap-2 text-primary">
            <Wallet className="h-6 w-6 text-accent" />
            Thanh toán qua ví điện tử
          </DialogTitle>
          <DialogDescription className="text-sm">
            Quét mã QR hoặc chuyển khoản theo số tài khoản bên dưới để hoàn tất đặt tour <span className="font-semibold text-foreground">{tourName}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-[1fr_1.1fr]">
          {/* QR side */}
          <div className="bg-gradient-to-br from-secondary/60 to-background p-6 flex flex-col items-center justify-center border-r border-border">
            <div className="rounded-2xl overflow-hidden shadow-elevated bg-white p-2 max-w-[260px] w-full">
              <img src={paymentQR} alt="QR thanh toán" className="w-full h-auto rounded-xl" />
            </div>
            <p className="mt-4 text-xs text-muted-foreground text-center">
              Mở app ngân hàng / ví điện tử và quét mã VietQR
            </p>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-success font-medium">
              <ShieldCheck className="h-3.5 w-3.5" />
              Bảo mật bởi VietQR · Viettel Money
            </div>
          </div>

          {/* Details side */}
          <div className="p-6 space-y-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Số tiền cần thanh toán</p>
              <p className="font-display text-3xl font-bold text-primary mt-1">{formatVND(amount)}</p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Chọn ví thanh toán</p>
              <div className="grid grid-cols-2 gap-2">
                {wallets.map((w) => (
                  <button
                    key={w.id}
                    onClick={() => setSelected(w.id)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border-2 transition-smooth text-left ${
                      selected === w.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/40"
                    }`}
                  >
                    <span className={`h-7 w-7 rounded-md ${w.color} text-white text-[10px] font-bold flex items-center justify-center shrink-0`}>
                      {w.short}
                    </span>
                    <span className="text-sm font-medium text-foreground">{w.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-muted/40 p-4 space-y-2.5">
              <div className="flex justify-between items-start text-sm">
                <span className="text-muted-foreground flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5" /> Ngân hàng</span>
                <span className="font-medium text-foreground text-right">MB Bank (ViettelPay)</span>
              </div>
              <div className="flex justify-between items-start text-sm">
                <span className="text-muted-foreground">Chủ tài khoản</span>
                <span className="font-semibold text-foreground">NGUYỄN VĂN NGHĨA</span>
              </div>
              <div className="flex justify-between items-center text-sm gap-2">
                <span className="text-muted-foreground">Số tài khoản</span>
                <button
                  onClick={handleCopy}
                  className="font-mono font-semibold text-foreground flex items-center gap-1.5 hover:text-primary transition-smooth"
                >
                  {accountNumber}
                  {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
              <div className="flex justify-between items-start text-sm pt-2 border-t border-border/60">
                <span className="text-muted-foreground">Nội dung</span>
                <span className="font-mono text-xs text-foreground">TV{Date.now().toString().slice(-6)}</span>
              </div>
            </div>

            <div className="flex items-start gap-2 text-xs text-muted-foreground bg-accent-soft/60 border border-accent/20 rounded-lg p-3">
              <Smartphone className="h-4 w-4 text-accent shrink-0 mt-0.5" />
              <span>Vui lòng giữ nguyên nội dung chuyển khoản. Đơn hàng sẽ được xác nhận tự động sau 1-5 phút.</span>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Huỷ</Button>
              <Button variant="hero" className="flex-1" onClick={handleConfirm}>Tôi đã chuyển khoản</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;
