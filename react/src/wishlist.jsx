import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gameApi from '../../api/gameApi';
import { formatCurrency } from '../../utils/formatCurrency';
import useGameDiscount from '../../hooks/gameDiscount';
import './wishlist.css';

const Wishlist = () => {
    const navigate = useNavigate();
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const { calculateDiscount } = useGameDiscount();

    useEffect(() => {
        const fetchWishlist = async () => {
            try {
                const data = await gameApi.getWishlist();
                setWishlistItems(data.data || []);
            } catch (error) {
                console.error("Lỗi khi tải danh sách ước:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchWishlist();
    }, []);

    const handleRemove = async (e, gameId) => {
        e.stopPropagation();
        try {
            await gameApi.removeWishlist(gameId);
            setWishlistItems(prev => prev.filter(item => item._id !== gameId));
        } catch (error) {
            console.error("Lỗi khi xóa khỏi danh sách ước:", error);
        }
    };

    if (loading) {
        return (
            <div style={{ height: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <h1 style={{ backgroundColor: 'var(--sunflower-gold)', padding: '20px', border: 'var(--border-thick)', boxShadow: 'var(--shadow-hard)', fontWeight: 950 }}>
                    ĐANG TẢI DANH SÁCH ƯỚC...
                </h1>
            </div>
        );
    }

    // Class helper cho phong cách Metro
    const getTileClass = (index) => {
        // Tạo các class gạch khác nhau tùy theo index để xếp thành Grid
        const pattern = index % 5;
        if (pattern === 0) return 'wishlist-tile-large'; // To nhất
        if (pattern === 1) return 'wishlist-tile-normal'; // Bình thường
        if (pattern === 2) return 'wishlist-tile-tall';   // Dọc
        if (pattern === 3) return 'wishlist-tile-wide';   // Ngang
        if (pattern === 4) return 'wishlist-tile-normal'; // Bình thường
        return 'wishlist-tile-normal';
    };

    return (
        <div className="wishlist-container">
            <header className="wishlist-header">
                <h1 className="wishlist-title">DANH SÁCH ƯỚC</h1>
                {wishlistItems.length > 0 && (
                    <div className="wishlist-count">
                        MỤC TIÊU: <span style={{ color: 'var(--flag-red)' }}>{wishlistItems.length} GAME</span>
                    </div>
                )}
            </header>

            {wishlistItems.length > 0 ? (
                <div className="wishlist-metro-grid">
                    {wishlistItems.map((game, index) => {
                        const { finalDiscount, discountedPrice } = calculateDiscount(game);
                        return (
                            <div
                                key={game._id}
                                className={`wishlist-tile ${getTileClass(index)}`}
                                onClick={() => navigate(`/game/${game._id}`)}
                            >
                                <img
                                    src={game.media?.coverImage || 'https://via.placeholder.com/600x800'}
                                    alt={game.name}
                                />
                                {game.price > 0 && finalDiscount > 0 && (
                                    <div style={{ position: 'absolute', top: 5, right: 5, backgroundColor: '#e53935', color: 'white', padding: '2px 5px', borderRadius: '4px', fontWeight: 'bold' }}>-{finalDiscount}%</div>
                                )}
                                <button
                                    className="btn-remove-wishlist"
                                    onClick={(e) => handleRemove(e, game._id)}
                                >
                                    XÓA
                                </button>

                                <div className="wishlist-overlay">
                                    <h3 className="wishlist-name">{game.name}</h3>
                                    <div className="wishlist-price">
                                        {finalDiscount > 0 ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                                <span style={{ textDecoration: 'line-through', color: '#888', fontSize: '0.8em' }}>{formatCurrency(game.price)}</span>
                                                <span style={{ color: '#90EE90' }}>{formatCurrency(discountedPrice)}</span>
                                            </div>
                                        ) : (
                                            formatCurrency(game.price)
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="wishlist-empty">
                    <h2>DANH SÁCH ƯỚC TRỐNG</h2>
                    <p>Hãy thêm những trò chơi bạn muốn sở hữu vào đây nhé.</p>
                    <button
                        className="btn-explore"
                        onClick={() => navigate('/')}
                    >
                        KHÁM PHÁ CỬA HÀNG
                    </button>
                </div>
            )}
        </div>
    );
};

export default Wishlist;