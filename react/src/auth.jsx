import { useState } from 'react';
import './auth.css';
import authApi from '../../api/authApi';
import { manageToken, getInfor } from '../../utils/manageToken';
import { toast } from '../notification/toast';
import ForgotPass from './fomrForgotPass';

// Component Login chính
const Login = () => {
    const [view, setView] = useState('auth'); // 'auth' hoặc 'forgot'
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    // Xử lý sự kiện submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isLogin) {
                const result = await authApi.login(email, password);
                if (result.message === 'dang nhap thanh cong') {
                    if (getInfor(result.token)) {
                        manageToken.setToken(result.token);
                        toast.success("Đăng nhập thành công!");
                        window.location.href = '/'; // Chuyển hướng và load lại trang để Header nhận token mới
                        return;
                    }
                } else {
                    toast.error(result.message || "Email hoặc mật khẩu không chính xác!");
                }
            } else {
                // Xử lý Đăng ký
                if (password !== confirmPassword) {
                    toast.warning("Mật khẩu không khớp!");
                    setLoading(false);
                    return;
                }
                const result = await authApi.resgister(username, email, password);
                if (result.success || result.message === 'dang ky thanh cong, vui long kiem tra email de xac thuc tai khoan') {
                    toast.success("Đăng ký thành công! Hãy kiểm tra email.");
                    // setIsLogin(true);
                } else {
                    toast.error(result.message || "Đăng ký thất bại");
                }
            }
        } catch (error) {
            console.error(error);
            toast.error("Đã có lỗi xảy ra!");
        } finally {
            setLoading(false);
        }
    };

    if (view === 'forgot') {
        return <ForgotPass onBack={() => setView('auth')} />;
    }

    return (
        <div className="login-container">

            {/* CỘT TRÁI — Hero Branding */}
            <div className="auth-left-panel">
                <div className="panel-noise" />

                <div className="web-header">
                    <div className="web-title-wrapper">
                        <span className="web-icon">🎮</span>
                        <h1 className="web-title">
                            <span className="title-word t-poor">POOR</span>
                            <span className="title-dash">-</span>
                            <span className="title-word t-gamer">GAMER</span>
                            <span className="title-break"> </span>
                            <span className="title-word t-hub">HUB</span>
                        </h1>
                        <span className="web-badge">EST. 2025</span>
                    </div>
                    <span className="web-slogan">💸 GAME CHO NGƯỜI NGHÈO 💸</span>
                </div>

                <p className="hero-desc">
                    Kho game khổng lồ — giá hạt dẻ.<br />
                    Dành cho những gamer thực thụ.
                </p>

                <div className="hero-badges">
                    <span className="hero-badge hb-yellow">🔥 FLASH SALE MỖI NGÀY</span>
                    <span className="hero-badge hb-pink">💎 10,000+ GAME</span>
                    <span className="hero-badge hb-blue">⚡ GIAO HÀNG TỨC THÌ</span>
                    <span className="hero-badge hb-green">🎁 TẶNG COIN MỖI ĐƠN</span>
                </div>

                <div className="hero-deco-grid">
                    {['🕹️', '👾', '🏆', '💀', '🎯', '🃏', '🎲', '🔫'].map((icon, i) => (
                        <span key={i} className="deco-icon" style={{ animationDelay: `${i * 0.18}s` }}>{icon}</span>
                    ))}
                </div>

                <div className="hero-bottom-tape">POOR-GAMER-HUB • POOR-GAMER-HUB • POOR-GAMER-HUB •</div>
            </div>

            {/* CỘT PHẢI — Form */}
            <div className="auth-right-panel">
                <div className="login-card">
                    <h1 className="login-title">{isLogin ? "đăng nhập" : "đăng ký"}</h1>

                    <div className="auth-tabs">
                        <button
                            className={`auth-tab ${isLogin ? 'active' : ''}`}
                            onClick={() => setIsLogin(true)}
                        >
                            LOGIN
                        </button>
                        <button
                            className={`auth-tab ${!isLogin ? 'active' : ''}`}
                            onClick={() => setIsLogin(false)}
                        >
                            SIGN UP
                        </button>
                    </div>

                    <div className="error-msg" style={{ display: 'none' }}>
                        WRONG CREDENTIALS!
                    </div>

                    <form onSubmit={handleSubmit}>
                        {!isLogin && (
                            <div className="form-group">
                                <label className="form-label">tên người dùng</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="nhập username..."
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required={!isLogin}
                                />
                            </div>
                        )}

                        <div className="form-group">
                            <label className="form-label">email</label>
                            <input
                                type="email"
                                className="form-input"
                                placeholder="nhap_admin@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">mật khẩu</label>
                            <input
                                type="password"
                                className="form-input"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        {!isLogin && (
                            <div className="form-group">
                                <label className="form-label">xác nhận mật khẩu</label>
                                <input
                                    type="password"
                                    className="form-input"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required={!isLogin}
                                />
                            </div>
                        )}

                        {isLogin && (
                            <div className="login-footer">
                                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                                    <input type="checkbox" style={{ accentColor: 'var(--black)', width: '20px', height: '20px', border: '2px solid black' }} />
                                    REMEMBER ME
                                </label>
                                <a href="#" className="login-link" onClick={(e) => { e.preventDefault(); setView('forgot'); }}>FORGOT PASS?</a>
                            </div>
                        )}

                        <button type="submit" className="login-btn" disabled={loading}>
                            {loading ? "ĐANG XỬ LÝ..." : (isLogin ? "Login Now" : "Register Now")}
                        </button>
                    </form>
                </div>
            </div>

        </div>
    );
};

export default Login;