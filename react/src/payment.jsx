import React, { useState, useEffect } from "react";
import "./payment.css";
import authApi from "../../api/authApi";
import { formatCurrency } from "../../utils/formatCurrency";
import { toast } from "../notification/toast";
import { CircleDollarSign, Wallet, Coins } from "lucide-react";
import { getInfor } from "../../utils/manageToken";
import { useSocket } from "../../context/socketContext";
const Payment = () => {
    const [selectedAmount, setSelectedAmount] = useState(50000);
    const [customAmount, setCustomAmount] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [amount, setAmount] = useState(0);
    const { socket } = useSocket();
    const loadAmount = async () => {
        const response = await authApi.getAmoutById(getInfor().id);
        setAmount(response.amount);
        console.log(response);
    }
    useEffect(() => {
        loadAmount();
    }, []);
    useEffect(() => {
        if (!socket) return;
        socket.on('nap_tien_thanh_cong', () => {
            toast.success("Nạp tiền thành công");
            loadAmount();
        })
    }, [socket]);
    const predefinedAmounts = [10000, 20000, 50000, 100000, 200000, 500000];

    const handleAmountClick = (amount) => {
        setSelectedAmount(amount);
        setCustomAmount("");
    };

    const handleCustomAmountChange = (e) => {
        const value = e.target.value.replace(/[^0-9]/g, "");
        setCustomAmount(value);
        if (value) {
            setSelectedAmount(null);
        }
    };

    const handlePayment = async () => {
        const finalAmount = customAmount ? parseInt(customAmount) : selectedAmount;

        if (!finalAmount || finalAmount < 2000) {
            toast.error("Số tiền nạp tối thiểu là 2.000 VNĐ");
            return;
        }

        setIsLoading(true);
        try {
            const response = await authApi.updateMoney(finalAmount);
            if (response && response.checkoutUrl) {
                toast.success("Đang chuyển hướng đến trang thanh toán...");
                // Chuyển hướng đến URL thanh toán
                window.open(response.checkoutUrl, '_blank');
            } else {
                toast.error(response.message || "Không thể tạo link thanh toán");
            }
        } catch (error) {
            console.error("Lỗi thanh toán:", error);
            toast.error("Đã có lỗi xảy ra, vui lòng thử lại sau");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="payment-container">
            <h1 className="payment-title">NẠP TIỀN VÀO VÍ</h1>

            <div className="current-balance-box">
                <div className="balance-label">
                    <Coins size={20} />
                    SỐ DƯ HIỆN TẠI
                </div>
                <div className="balance-value">
                    {formatCurrency(amount || 0)}
                </div>
            </div>

            <div className="payment-section">
                <div className="payment-section-title">
                    <CircleDollarSign size={24} />
                    CHỌN MỆNH GIÁ CÓ SẴN
                </div>
                <div className="amounts-grid">
                    {predefinedAmounts.map((amount) => (
                        <div
                            key={amount}
                            className={`amount-card ${selectedAmount === amount ? "active" : ""}`}
                            onClick={() => handleAmountClick(amount)}
                        >
                            {formatCurrency(amount)}
                        </div>
                    ))}
                </div>
            </div>

            <div className="custom-amount-container">
                <div className="payment-section-title">
                    <Wallet size={24} />
                    HOẶC NHẬP SỐ TIỀN TÙY CHỈNH (VNĐ)
                </div>
                <input
                    type="text"
                    className="custom-amount-input"
                    placeholder="Ví dụ: 15000"
                    value={customAmount}
                    onChange={handleCustomAmountChange}
                />
            </div>

            <button
                className="payment-submit-btn"
                onClick={handlePayment}
                disabled={isLoading || (!selectedAmount && !customAmount)}
            >
                {isLoading ? "ĐANG XỬ LÝ..." : "THANH TOÁN NGAY"}
            </button>
        </div>
    );
};

export default Payment;