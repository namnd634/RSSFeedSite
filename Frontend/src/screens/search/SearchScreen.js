import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import "./SearchScreen.css";
import { ClipLoader } from "react-spinners";
import ThemeToggle from "../../components/themetoggle/ThemeToggle";
import ScrollToTop from "../../components/scrolltop/ScrollToTop";

const SearchScreen = () => {
  const location = useLocation();
  const searchResults = location.state?.searchResults || [];
  const initialKeyword = useSelector((state) => state.search.keyword);
  const [keyword, setKeyword] = useState(initialKeyword);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortedResults, setSortedResults] = useState([]);
  const articlesPerPage = 8;

  // Function to sort articles by date
  const sortArticlesByDate = (articles) => {
    return articles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
  };

  // Function to get the logo URL of the source
  const getLogoUrl = (source) => {
    if (/thanhnien\.vn/.test(source)) {
      return "https://static.thanhnien.com.vn/thanhnien.vn/image/logo.svg";
    } else if (/vnexpress\.net/.test(source)) {
      return "https://s1.vnecdn.net/vnexpress/restruct/i/v9505/v2_2019/pc/graphics/logo.svg";
    } else if (/nhandan\.vn/.test(source)) {
      return "https://upload.wikimedia.org/wikipedia/vi/d/d7/Logo-NhanDan.png?20221117215128";
    } else if (/dantri\.com\.vn/.test(source)) {
      return "https://icdn.dantri.com.vn/2022/12/14/3-1671004462503.png";
    } else if (/tuoitre\.vn/.test(source)) {
      return "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Tu%E1%BB%95i_Tr%E1%BA%BB_Logo.svg/2560px-Tu%E1%BB%95i_Tr%E1%BA%BB_Logo.svg.png";
    } else {
      return "";
    }
  };

  // Function to process each article from JSON data
  const parseArticles = (item) => {
    const title = item.title || "No title";
    const description = item.description || "No description";
    const pubDate = item.pubDate || "No date";
    const link = item.link || "#";
    const imageUrl = item.img || "/default-image.jpg"; // Sử dụng `img` từ dữ liệu hoặc ảnh mặc định
    const sourceLogo = getLogoUrl(item.url);
    const arrangedCategory = item.arrangedCategory || "No category";

    return {
      title,
      description,
      pubDate,
      imageUrl,
      link,
      sourceLogo,
      arrangedCategory,
    };
  };

  useEffect(
    () => {
      window.scrollTo(0, 0);

      // Cập nhật từ khóa khi có dữ liệu tìm kiếm mới
      if (location.state?.searchResults) {
        setSelectedCategory("");
        setKeyword(initialKeyword); // Cập nhật từ khóa
      }

      const parsedArticles = searchResults.map(parseArticles);
      const sortedArticles = sortArticlesByDate(parsedArticles);
      setSortedResults(sortedArticles);
      setCurrentPage(1); // Reset to the first page when search results change
      setLoading(false);

      // Tính số lượng bài viết cho từng danh mục
      const counts = calculateCategoryCounts(parsedArticles);
      setCategoryCounts(counts);
    },
    [searchResults],
    [location.state?.searchResults, initialKeyword]
  );

  const indexOfLastArticle = currentPage * articlesPerPage;
  const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;

  // Pagination functions
  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    window.scrollTo(0, 0);
  };
  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
    window.scrollTo(0, 0);
  };
  const firstPage = () => {
    setCurrentPage(1);
    window.scrollTo(0, 0); // Scroll to top when navigating to the first page
  };

  const lastPage = () => {
    setCurrentPage(totalPages);
    window.scrollTo(0, 0); // Scroll to top when navigating to the last page
  };

  // Date formatting function
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return `${text.slice(0, maxLength)}...`;
  };

  // Article list display
  const ArticleList = () => (
    <div className="articles-list">
      {currentArticles.map((result, index) => (
        <div key={index} className="article-item">
          <a href={result.link} target="_blank" rel="noopener noreferrer">
            <div className="article-content">
              <img
                src={result.imageUrl}
                alt={result.title}
                className="article-image"
                onError={(e) => {
                  e.target.src = "/default-image.jpg";
                }}
              />
              <div className="article-text">
                <h2>{result.title}</h2>
                <p>{truncateText(result.description, 150)}</p>
                <img
                  src={result.sourceLogo}
                  alt="Logo"
                  className="source-logo"
                />
                <p>{formatDate(result.pubDate)}</p>
              </div>
            </div>
          </a>
        </div>
      ))}
    </div>
  );

  // Pagination component
  const Pagination = () => (
    <div className="pagination">
      <button onClick={firstPage} disabled={currentPage === 1}>
        Trang đầu
      </button>
      <button onClick={prevPage} disabled={currentPage === 1}>
        Trang trước
      </button>
      <span>
        Trang {currentPage} / {totalPages}
      </span>
      <button onClick={nextPage} disabled={currentPage === totalPages}>
        Trang sau
      </button>
      <button onClick={lastPage} disabled={currentPage === totalPages}>
        Trang cuối
      </button>
    </div>
  );

  const [selectedCategory, setSelectedCategory] = useState("");

  const filteredArticles = sortedResults.filter(
    (article) =>
      !selectedCategory || article.arrangedCategory === selectedCategory
  );

  const currentArticles = filteredArticles.slice(
    indexOfFirstArticle,
    indexOfLastArticle
  );

  const totalPages = Math.ceil(filteredArticles.length / articlesPerPage);

  const [categoryCounts, setCategoryCounts] = useState({});

  // Hàm tính số lượng bài viết cho từng danh mục
  const calculateCategoryCounts = (articles) => {
    const counts = articles.reduce((counts, article) => {
      const category = article.arrangedCategory || "No category";
      counts[category] = (counts[category] || 0) + 1;
      return counts;
    }, {});

    // Thêm danh mục "Tất cả" ("" key) với tổng số bài viết
    counts[""] = articles.length;
    return counts;
  };

  // Main SearchScreen component
  return (
    <div className="search-container">
      <div className="right-column-search">
        <h2>Danh mục bài viết</h2>
        <ul className="category-list">
          {Object.entries({
            "": "Tất cả",
            "the-gioi": "Thế giới",
            "thoi-su": "Thời sự",
            "kinh-te": "Kinh tế",
            "giai-tri": "Giải trí",
            "the-thao": "Thể thao",
            "giao-duc": "Giáo dục",
            "du-lich": "Du lịch",
            xe: "Xe",
            "van-hoa": "Văn hóa",
            "doi-song": "Đời sống",
            "phap-luat-chinh-tri": "Pháp luật - Chính trị",
            "suc-khoe-doi-song": "Sức khỏe - Đời sống",
            "khoa-hoc-cong-nghe": "Khoa học - Công nghệ",
          }).map(([key, value]) => {
            const count = categoryCounts[key] || 0; // Số lượng bài viết cho danh mục
            return (
              <li key={key}>
                <button
                  className={`category-button ${
                    selectedCategory === key ? "active" : ""
                  }`}
                  onClick={() => {
                    setSelectedCategory(key);
                    setCurrentPage(1); // Reset về trang đầu
                  }}
                >
                  {value} ({count})
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="search-screen">
        <div className="result-title">
          <h1>
            {keyword
              ? `Kết quả tìm kiếm cho từ khóa: ${keyword}`
              : "Vui lòng nhập từ khóa trên thanh tìm kiếm"}
          </h1>
        </div>
        {loading ? (
          <div className="loading-search">
            <ClipLoader color="#3498db" size={50} />
          </div>
        ) : filteredArticles.length === 0 ? ( // Kiểm tra filteredArticles thay vì sortedResults
          <div className="no-results-search">
            <div className="no-results-icon">🔍</div>
            <p>Không tìm thấy kết quả</p>
          </div>
        ) : (
          <>
            <ArticleList />
            <Pagination />
          </>
        )}
        <ThemeToggle />
        <ScrollToTop />
      </div>
    </div>
  );
};

export default SearchScreen;
