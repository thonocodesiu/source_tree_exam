import React, { useEffect, useState } from "react";
import historyApi from "../../api/historyApi";
import gameApi from "../../api/gameApi";
import "./history.css";

const History = () => {
    const [historyData, setHistoryData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [gamesCache, setGamesCache] = useState({});
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [filterType, setFilterType] = useState("all");
    const itemsPerPage = 5;

    // Lấy dữ liệu lịch sử từ API
    useEffect(() => {
        const fetchHistoryAndGames = async () => {
            try {
                const response = await historyApi.getHistory();
                const data = response.data || response;
                if (Array.isArray(data)) {
                    const sortedData = [...data].sort((a, b) => {
                        const dateA = a.createdAt?.$date ? new Date(a.createdAt.$date) : new Date(a.createdAt);
                        const dateB = b.createdAt?.$date ? new Date(b.createdAt.$date) : new Date(b.createdAt);
                        return dateB - dateA;
                    });
                    setHistoryData(sortedData);
                    setFilteredData(sortedData);

                    // Thu thập tất cả gameId từ các giao dịch buying
                    const allGameIds = new Set();
                    sortedData.forEach(item => {
                        if (item.type === "buying" && item.gameIds) {
                            item.gameIds.forEach(idObj => {
                                const id = typeof idObj === 'string' ? idObj : (idObj.$oid || idObj);
                                if (id) allGameIds.add(id);
                            });
                        }
                    });

                    // Lấy chi tiết game (caching)
                    if (allGameIds.size > 0) {
                        const gamePromises = Array.from(allGameIds).map(id =>
                            gameApi.getGameById(id).then(res => ({ id, data: res.data || res }))
                        );
                        const gamesResults = await Promise.all(gamePromises);
                        const cache = {};
                        gamesResults.forEach(res => {
                            cache[res.id] = res.data;
                        });
                        setGamesCache(cache);
                    }
                }
            } catch (error) {
                console.error("Lỗi khi tải lịch sử hoặc thông tin game:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistoryAndGames();
    }, []);

    // Xử lý lọc dữ liệu
    useEffect(() => {
        if (filterType === "all") {
            setFilteredData(historyData);
        } else {
            setFilteredData(historyData.filter(item => item.type === filterType));
        }
        setCurrentPage(1);
    }, [filterType, historyData]);

    // Tính toán phân trang
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Định dạng ngày tháng
    const formatDate = (dateInput) => {
        const dateString = dateInput?.$date || dateInput;
        const date = new Date(dateString);
        return date.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    // Định dạng tiền tệ
    const formatCurrency = (value) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(value);
    };

    if (loading) {
        return (
            <div className="history-loading-container">
                <div className="status-card">Đang tải dữ liệu...</div>
            </div>
        );
    }

    return (
        <div className="history-container">
            <div className="history-title-box">
                <h1 className="history-title">Nhật ký giao dịch</h1>
                <div className="history-subtitle">Theo dõi mọi hoạt động tài chính của bạn</div>
            </div>

            <div className="history-filters">
                <button
                    className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
                    onClick={() => setFilterType('all')}
                >
                    Tất cả
                </button>
                <button
                    className={`filter-btn ${filterType === 'amount' ? 'active' : ''}`}
                    onClick={() => setFilterType('amount')}
                >
                    Nạp tiền
                </button>
                <button
                    className={`filter-btn ${filterType === 'buying' ? 'active' : ''}`}
                    onClick={() => setFilterType('buying')}
                >
                    Mua game
                </button>
            </div>

            <div className="history-list">
                {currentItems.length === 0 ? (
                    <div className="history-empty-container">
                        <div className="status-card">Chưa có giao dịch phù hợp</div>
                    </div>
                ) : (
                    currentItems.map((item) => (
                        <div key={item._id} className={`history-item ${item.type}`}>
                            <div className="item-icon-box">
                                {item.type === "amount" ? "💰" : "🎮"}
                            </div>

                            <div className="item-main-area">
                                <div className="item-header">
                                    <span className="item-type-badge">
                                        {item.type === "amount" ? "Nạp tiền" : "Mua game"}
                                    </span>
                                    <span className="item-date">📅 {formatDate(item.createdAt)}</span>
                                </div>

                                <div className="item-content">
                                    <div className="item-main-info">
                                        {/* <span className="item-id">ID: {item._id}</span> */}
                                        <div className="item-value">
                                            {item.type === "amount" ? "+" : "-"} {formatCurrency(item.totalValue)}
                                        </div>
                                    </div>

                                    <div className="item-details">
                                        {item.type === "buying" && item.gameIds && item.gameIds.length > 0 && (
                                            <div className="purchased-games-list">
                                                {item.gameIds.map((idObj, idx) => {
                                                    const id = typeof idObj === 'string' ? idObj : (idObj.$oid || idObj);
                                                    const game = gamesCache[id];
                                                    return (
                                                        <div key={idx} className="mini-game-card">
                                                            {game?.media?.coverImage && (
                                                                <img src={game.media.coverImage} alt={game.name} className="mini-game-img" />
                                                            )}
                                                            <span className="mini-game-name">{game?.name || "Đang tải..."}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                        <div className={`status-tag ${item.isHide ? 'hidden' : 'visible'}`}>
                                            {item.isHide ? "Đã ẩn" : "Công khai"}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {totalPages > 1 && (
                <div className="pagination">
                    <button
                        className="page-btn nav-btn"
                        onClick={() => paginate(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                    >
                        Trước
                    </button>

                    {[...Array(totalPages)].map((_, idx) => (
                        <button
                            key={idx + 1}
                            className={`page-btn ${currentPage === idx + 1 ? 'active' : ''}`}
                            onClick={() => paginate(idx + 1)}
                        >
                            {idx + 1}
                        </button>
                    ))}

                    <button
                        className="page-btn nav-btn"
                        onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                    >
                        Sau
                    </button>
                </div>
            )}
        </div>
    );
};

export default History;