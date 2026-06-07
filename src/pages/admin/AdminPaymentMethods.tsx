import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { paymentAPIs } from "../../lib/api";
import { useToast } from "../../hooks/use-toast";
import { Plus, Edit, Trash2, CheckCircle, XCircle } from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";

const AdminPaymentMethods = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "bank_transfer",
    description: "",
    account_details: "",
    is_active: true,
  });
  const [qrCodeFile, setQrCodeFile] = useState<File | null>(null);

  const { data: methodsResponse, isLoading } = useQuery({
    queryKey: ["adminPaymentMethods"],
    queryFn: paymentAPIs.getPaymentMethods,
  });

  const methods = methodsResponse?.data?.data || [];

  const createMutation = useMutation({
    mutationFn: paymentAPIs.createPaymentMethod,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminPaymentMethods"] });
      toast({ title: "Thành công", description: "Đã thêm phương thức thanh toán." });
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      toast({ title: "Lỗi", description: error.response?.data?.message || "Không thể thêm", variant: "destructive" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: any }) => paymentAPIs.updatePaymentMethod(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminPaymentMethods"] });
      toast({ title: "Thành công", description: "Đã cập nhật phương thức thanh toán." });
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      toast({ title: "Lỗi", description: error.response?.data?.message || "Không thể cập nhật", variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: paymentAPIs.deletePaymentMethod,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminPaymentMethods"] });
      toast({ title: "Thành công", description: "Đã xóa phương thức thanh toán." });
    },
    onError: (error: any) => {
      toast({ title: "Lỗi", description: "Không thể xóa", variant: "destructive" });
    }
  });

  const handleOpenDialog = (method = null) => {
    if (method) {
      setEditingMethod(method);
      setFormData({
        name: method.name || "",
        type: method.type || "bank_transfer",
        description: method.description || "",
        account_details: method.account_details || "",
        is_active: method.is_active,
      });
    } else {
      setEditingMethod(null);
      setFormData({
        name: "",
        type: "bank_transfer",
        description: "",
        account_details: "",
        is_active: true,
      });
    }
    setQrCodeFile(null);
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    data.append('name', formData.name);
    data.append('type', formData.type);
    data.append('description', formData.description);
    data.append('account_details', formData.account_details);
    data.append('is_active', formData.is_active ? '1' : '0');
    
    if (qrCodeFile) {
      data.append('qr_code', qrCodeFile);
    }

    if (editingMethod) {
      updateMutation.mutate({ id: editingMethod.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  if (isLoading) return <div className="p-8 text-center">Đang tải...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý Thanh toán</h1>
        <Button onClick={() => handleOpenDialog()} className="bg-primary hover:bg-primary-dark">
          <Plus className="w-4 h-4 mr-2" /> Thêm Phương Thức
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loại</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">QR Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Thao tác</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {methods.map((method: any) => (
              <tr key={method.id}>
                <td className="px-6 py-4 whitespace-nowrap font-medium">{method.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {method.type === 'bank_transfer' ? 'Chuyển khoản' : method.type === 'e_wallet' ? 'Ví điện tử' : 'Tiền mặt'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {method.qr_code_url ? (
                    <img src={method.qr_code_url} alt="QR Code" className="h-10 w-10 object-cover rounded border" />
                  ) : (
                    <span className="text-gray-400 text-sm">Không có</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {method.is_active ? (
                    <span className="text-green-500 flex items-center"><CheckCircle className="w-4 h-4 mr-1"/> Bật</span>
                  ) : (
                    <span className="text-red-500 flex items-center"><XCircle className="w-4 h-4 mr-1"/> Tắt</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => handleOpenDialog(method)} className="text-blue-600 hover:text-blue-900 mr-4">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => {
                      if(window.confirm('Bạn có chắc muốn xóa?')) deleteMutation.mutate(method.id)
                    }} 
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {methods.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  Chưa có phương thức thanh toán nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>{editingMethod ? "Sửa Phương Thức" : "Thêm Phương Thức"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Tên phương thức (VD: Momo, Vietcombank)</Label>
              <Input 
                required 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
              />
            </div>
            
            <div>
              <Label>Loại thanh toán</Label>
              <select 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
              >
                <option value="bank_transfer">Chuyển khoản ngân hàng</option>
                <option value="e_wallet">Ví điện tử (Momo, ZaloPay...)</option>
                <option value="cash">Tiền mặt</option>
              </select>
            </div>

            <div>
              <Label>Mô tả (Hướng dẫn khách thanh toán)</Label>
              <Textarea 
                value={formData.description} 
                onChange={(e) => setFormData({...formData, description: e.target.value})} 
                placeholder="Ví dụ: Vui lòng chuyển khoản với nội dung: MÃ ĐƠN HÀNG - SĐT"
              />
            </div>

            {formData.type !== 'cash' && (
              <>
                <div>
                  <Label>Thông tin tài khoản (Số TK, Chủ TK)</Label>
                  <Textarea 
                    value={formData.account_details} 
                    onChange={(e) => setFormData({...formData, account_details: e.target.value})} 
                    placeholder="Chủ tài khoản: NGUYEN VAN A&#10;Số tài khoản: 123456789"
                  />
                </div>
                <div>
                  <Label>Ảnh QR Code (Tùy chọn)</Label>
                  <Input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => setQrCodeFile(e.target.files?.[0] || null)}
                  />
                </div>
              </>
            )}

            <div className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
              />
              <Label htmlFor="is_active">Hoạt động</Label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Hủy</Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {createMutation.isPending || updateMutation.isPending ? "Đang lưu..." : "Lưu"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPaymentMethods;
