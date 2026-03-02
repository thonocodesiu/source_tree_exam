import React, { useState, useEffect } from 'react';
import discountApi from '../../api/discountApi';
import gameApi from '../../api/gameApi';
import categoryApi from '../../api/categoryApi';
import useGameDiscount from '../../hooks/gameDiscount';
import { useNavigate } from 'react-router-dom';
import './discount.css';

const Discount = () => {
    const [discounts, setDiscounts] = useState([]);
    const [games, setGames] = useState([]);
    const [categories, setCategories] = useState({});
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { calculateDiscount } = useGameDiscount();

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch discounts, games and categories in parallel
                const [discountRes, gamesData, categoriesData] = await Promise.all([
                    discountApi.getAllDiscount(),
                    gameApi.getAllGames(),
                    categoryApi.getAllCategories()
                ]);

                const dData = await discountRes.json();
                const dList = Array.isArray(dData) ? dData : dData?.data || dData?.elements || [];
                setDiscounts(dList.filter(d => d.isActive));

                setGames(gamesData);

                // Map categories by ID for easy lookup
                const catMap = {};
                const catList = Array.isArray(categoriesData) ? categoriesData : categoriesData?.data || [];
                catList.forEach(cat => {
                    catMap[cat._id] = cat.name;
                });
                setCategories(catMap);

            } catch (error) {
                console.error("Lỗi khi tải dữ liệu:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return '???';
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    if (loading) {
        return (
            <div className="discount-loading">
                <h1>ĐANG TẢI DỮ LIỆU...</h1>
            </div>
        );
    }
    const saleGames = games.map(game => {
        const { finalDiscount, discountedPrice } = calculateDiscount(game);
        return { ...game, finalDiscount, discountedPrice };
    }).filter(game => game.finalDiscount > 0);

    return (
        <div className="discount-container">
            <header className="discount-header">
                <h1 className="discount-title">SỰ KIỆN <span className="highlight-text">GIẢM GIÁ</span></h1>
                <div className="discount-subtitle">CƠ HỘI SỞ HỮU GAME XỊN GIÁ "HẠT DẺ"</div>
            </header>
            <section className="discount-events-section">
                <h2 className="section-title">SỰ KIỆN ĐANG DIỄN RA</h2>
                {discounts.length > 0 ? (
                    <div className="discount-grid">
                        {discounts.map((item, index) => (
                            <div key={item._id || index} className="discount-card">
                                <div className="discount-badge">-{item.discount}%</div>
                                <div className="card-content">
                                    <h2 className="event-name">{item.name || "SỰ KIỆN KHUYẾN MÃI"}</h2>
                                    <div className="event-time">
                                        <span>BẮT ĐẦU: {formatDate(item.startDate)}</span>
                                        <span>KẾT THÚC: {formatDate(item.endDate)}</span>
                                    </div>
                                    <button className="btn-view-event" onClick={() => navigate('/')}>
                                        ĐẾN CỬA HÀNG
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="discount-empty">
                        <h2>HIỆN KHÔNG CÓ SỰ KIỆN NÀO</h2>
                    </div>
                )}
            </section>

            {/* Phần hiển thị chi tiết các game đang sale */}
            <section className="sale-games-section">
                <h2 className="section-title">GAME ĐANG <span className="highlight-text-blue">GIẢM GIÁ</span></h2>
                {saleGames.length > 0 ? (
                    <div className="sale-games-grid">
                        {saleGames.map(game => (
                            <div key={game._id} className="game-sale-card" onClick={() => navigate(`/game/${game._id}`)}>
                                <div className="game-image-container">
                                    <img src={game.media?.[0]?.url || 'https://via.placeholder.com/300x150'} alt={game.name} />
                                    <div className="game-sale-badge">-{game.finalDiscount}%</div>
                                </div>
                                <div className="game-sale-info">
                                    <h3 className="game-name">{game.name}</h3>
                                    <div className="game-categories">
                                        {(game.genre || []).slice(0, 2).map(catId => (
                                            <span key={catId} className="cat-tag">{categories[catId] || catId}</span>
                                        ))}
                                    </div>
                                    <div className="game-price-container">
                                        <span className="original-price">{formatPrice(game.price)}</span>
                                        <span className="discounted-price">{formatPrice(game.discountedPrice)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="discount-empty">
                        <h2>CHƯA CÓ GAME NÀO ĐƯỢC GIẢM GIÁ</h2>
                    </div>
                )}
            </section>
        </div>
    );
};

export default Discount;