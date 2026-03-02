import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import gameApi from '../../api/gameApi';
import categoryApi from '../../api/categoryApi';
import cryptoUtils from '../../../cryptojs';
import useGenreNav from '../../hooks/useGenreNav';
import { formatCurrency } from '../../utils/formatCurrency';
import useGameDiscount from '../../hooks/gameDiscount';
import '../home./home.css';
import './search.css';

const Search = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const initialName = queryParams.get('q') || '';
    const initialGenre = queryParams.get('genre') || '';

    const [results, setResults] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filter States
    const [filters, setFilters] = useState({
        name: initialName,
        genre: initialGenre,
        minPrice: '',
        maxPrice: ''
    });

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const cats = await categoryApi.getAllCategories();
                setCategories(cats || []);

            } catch (error) {
                console.error("Lỗi khi tải thể loại:", error);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        setFilters(prev => ({ ...prev, name: initialName, genre: initialGenre }));
    }, [initialName, initialGenre]);

    const handleSearch = async () => {
        setLoading(true);
        try {
            // Mã hóa trực tiếp đối tượng filters (Backend sẽ nhận được JSON và parse ra object)
            // Tránh việc dùng URLSearchParams làm chuỗi bị encode (%C4...) trước khi mã hóa
            const encryptedQuery = cryptoUtils.encrypt(filters);


            const data = await gameApi.searchGames(encryptedQuery);
            setResults(data);
        } catch (error) {
            console.error("Lỗi khi tìm kiếm:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        handleSearch();
    }, [filters.name, filters.genre]); // Tự động tìm kiếm khi query từ header hoặc thể loại thay đổi

    return (
        <div className="search-page-container">
            {/* Filter Panel */}
            <aside className="filter-panel">
                <h2 className="filter-panel-title">BỘ LỌC TÌM KIẾM</h2>

                <div className="filter-group-item">
                    <label>TÊN TRÒ CHƠI</label>
                    <input
                        type="text"
                        placeholder="Tìm tên..."
                        className="filter-input"
                        value={filters.name}
                        onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                    />
                </div>

                <div className="filter-group-item">
                    <label>THỂ LOẠI</label>
                    <select
                        className="filter-select"
                        value={filters.genre}
                        onChange={(e) => setFilters({ ...filters, genre: e.target.value })}
                    >
                        <option value="">TẤT CẢ THỂ LOẠI</option>
                        {categories.map(cat => (
                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                        ))}
                    </select>
                </div>

                <div className="filter-group-item">
                    <label>GIÁ (USD)</label>
                    <div className="price-inputs">
                        <input
                            type="number"
                            placeholder="Min"
                            className="filter-input-price"
                            value={filters.minPrice}
                            onChange={(e) => setFilters({ ...filters, minPrice: Number(e.target.value) })}
                        />
                        <span>-</span>
                        <input
                            type="number"
                            placeholder="Max"
                            className="filter-input-price"
                            value={filters.maxPrice}
                            onChange={(e) => setFilters({ ...filters, maxPrice: Number(e.target.value) })}
                        />
                    </div>
                </div>

                <button className="apply-filter-btn" onClick={handleSearch}>
                    ÁP DỤNG BỘ LỌC
                </button>
                <button
                    className="reset-filter-btn"
                    onClick={() => setFilters({ name: '', category: '', minPrice: '', maxPrice: '' })}
                >
                    ĐẶT LẠI
                </button>
            </aside>

            {/* Results Section */}
            <div className="search-results-main">
                <h2 className="section-title">
                    {results.length} KẾT QUẢ ĐƯỢC TÌM THẤY
                </h2>

                {loading ? (
                    <h1 style={{ color: 'var(--deep-space-blue)', fontWeight: 900, textAlign: 'center', marginTop: '50px' }}>
                        ĐANG TÌM KIẾM...
                    </h1>
                ) : results.length > 0 ? (
                    <div className="game-grid-steam">
                        {results.map((game) => (
                            <GameCard key={game._id} game={game} />
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', marginTop: '100px' }}>
                        <h2 style={{ color: 'var(--flag-red)', fontWeight: 950 }}>
                            KHÔNG TÌM THẤY TRÒ CHƠI NÀO.
                        </h2>
                        <p style={{ fontWeight: 700 }}>Hãy thử thay đổi bộ lọc để tìm kiếm nhé!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const GenreTag = ({ categoryId }) => {
    const [categoryName, setCategoryName] = useState("...");
    const { goToGenre } = useGenreNav();

    useEffect(() => {
        const fetchCategoryName = async () => {
            try {
                const result = await categoryApi.getCategoryById(categoryId);
                if (result) {
                    setCategoryName(result.name);
                } else {
                    setCategoryName(categoryId);
                }
            } catch (error) {
                setCategoryName(categoryId);
            }
        };
        if (categoryId) fetchCategoryName();
    }, [categoryId]);

    return (
        <span
            className="tag"
            onClick={(e) => { e.stopPropagation(); goToGenre(categoryId); }}
            style={{ cursor: 'pointer' }}
        >
            {categoryName}
        </span>
    );
};

// Sub-component cho thẻ game
const GameCard = ({ game }) => {
    const navigate = useNavigate();
    const { calculateDiscount } = useGameDiscount(); // Sử dụng Custom Hook vừa được tạo

    // Lấy ra giá trị giảm giá cao nhất và giá trị sau khi giảm  
    const { finalDiscount, discountedPrice } = calculateDiscount(game);

    return (
        <div className="game-card-steam" onClick={() => navigate(`/game/${game._id}`)}>
            <div className="card-media">
                <img src={game.media?.coverImage || 'https://via.placeholder.com/600x800'} alt={game.name} />
                {game.price === 0 && <span className="free-badge">FREE</span>}
                {game.price > 0 && finalDiscount > 0 && (
                    <span className="free-badge" style={{ backgroundColor: '#e53935' }}>-{finalDiscount}%</span>
                )}
            </div>
            <div className="card-details">
                <h3 className="game-name">{game.name}</h3>
                <div className="game-tags">
                    {game.genre && game.genre.slice(0, 2).map((genreId, i) => (
                        <GenreTag key={i} categoryId={genreId} />
                    ))}
                </div>
                <div className="card-footer" style={{ justifyContent: 'flex-end' }}>
                    <div className="card-price" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                        {finalDiscount > 0 ? (
                            <>
                                <span style={{ textDecoration: 'line-through', color: '#888', fontSize: '0.8em', marginBottom: '2px' }}>
                                    {formatCurrency(game.price)}
                                </span>
                                <span style={{ color: '#90EE90' }}>
                                    {formatCurrency(discountedPrice)}
                                </span>
                            </>
                        ) : (
                            formatCurrency(game.price)
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Search;