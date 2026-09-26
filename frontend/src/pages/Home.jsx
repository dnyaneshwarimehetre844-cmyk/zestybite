import { useState, useEffect, useCallback } from "react";

import api from "../api/axios";
import { getImageUrl } from "../api/helpers";
import FoodCard from "../components/FoodCard";
import { useAuth } from "../context/AuthContext";

const HERO_IMAGES = [
  "images/assets/banner_logo1.png",
  "images/assets/banner_logo2.png",
  "images/assets/banner_logo3.png",
  "images/assets/banner_logo4.png",
];

const TRENDING = [
  {
    name: "Cooked Noodles",
    img: "images/assets/f_32.png",
  },
  {
    name: "Tea",
    img: "images/assets/f_35.png",
  },
  {
    name: "Cheese Pasta",
    img: "images/assets/f_25.png",
  },
  {
    name: "Greek salad",
    img: "images/assets/f_1.png",
  },
  {
    name: "Chicken Rolls",
    img: "images/assets/f_7.png",
  },
  {
    name: "Chowmein",
    img: "images/assets/f_33.png",
  },
  {
    name: "Cappuccino Coffee",
    img: "images/assets/f_36.png",
  },
  {
    name: "biryani",
    img: "images/assets/f_34.png",
  },
  {
    name: "Cup Cake",
    img: "images/assets/f_17.png",
  },
  {
    name: "Vegen Sandwich",
    img: "images/assets/f_14.png",
  },
  {
    name: "Butterscotch Cake",
    img: "images/assets/f_19.png",
  },
  {
    name: "Cheese Burger",
    img: "images/assets/f_37.png",
  },
  {
    name: "Chocolate Coffee",
    img: "images/assets/f_40.png",
  },
  {
    name: "Bread Sandwich",
    img: "images/assets/f_16.png",
  },
  {
    name: "Vanilla Ice Cream",
    img: "images/assets/f_12.png",
  },
  {
    name: "Fruit Ice Cream",
    img: "images/assets/f_10.png",
  },
  {
    name: "Chicken Sandwich",
    img: "images/assets/f_13.png",
  },
  {
    name: "Veggie pizza",
    img: "images/assets/f_38.png",
  },
  {
    name: "Veg salad",
    img: "images/assets/f_2.png",
  },
];

export default function Home() {
  const [categoryTiles, setCategoryTiles] = useState([]);

  const [allItems, setAllItems] = useState([]);

  const [currentItems, setCurrentItems] = useState([]);

  const [activeCategory, setActiveCategory] = useState(null);

  const [expanded, setExpanded] = useState(false);

  const [heroSlide, setHeroSlide] = useState(0);

  const [recommended, setRecommended] = useState([]);

  const [offers, setOffers] = useState([]);

  const [offersLoading, setOffersLoading] = useState(true);

  const { user } = useAuth();

  const [loading, setLoading] = useState(true);

  const [noTransition, setNoTransition] = useState(false);

  const visibleCount = 8;

  const heroSlides = [...HERO_IMAGES, HERO_IMAGES[0]];

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroSlide((prev) => prev + 1);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  const handleHeroTransitionEnd = () => {
    if (heroSlide === HERO_IMAGES.length) {
      setNoTransition(true);

      setHeroSlide(0);
    }
  };

  useEffect(() => {
    if (noTransition) {
      const id = requestAnimationFrame(() => setNoTransition(false));

      return () => cancelAnimationFrame(id);
    }
  }, [noTransition]);

  useEffect(() => {
    const uid = user?._id || user?.id;

    if (!uid) {
      setRecommended([]);
      return;
    }

    api
      .get(`/ai/recommendations/${uid}`)
      .then((res) => setRecommended(res.data.items || []))
      .catch((err) => console.error("Failed to load recommendations:", err));
  }, [user]);

  const fetchFoods = useCallback(async () => {
    setLoading(true);

    try {
      const res = await api.get("/foods?limit=100");

      const items = res.data.items || [];

      setAllItems(items);
      setCurrentItems(items);
    } catch (err) {
      console.error("Failed to load foods:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategoryTiles = useCallback(async () => {
    try {
      const res = await api.get("/categories");

      setCategoryTiles(res.data.categories || []);
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  }, []);

  const fetchOffers = useCallback(async () => {
    setOffersLoading(true);

    try {
      const res = await api.get("/coupons/featured");

      setOffers(res.data.coupons || []);
    } catch (err) {
      console.error("Failed to load offers:", err);

      setOffers([]);
    } finally {
      setOffersLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFoods();
    fetchCategoryTiles();
    fetchOffers();
  }, [fetchFoods, fetchCategoryTiles, fetchOffers]);

  const toggleCategory = (cat) => {
    if (activeCategory === cat) {
      setActiveCategory(null);

      setCurrentItems(allItems);
    } else {
      setActiveCategory(cat);

      setCurrentItems(allItems.filter((item) => item.category === cat));
    }

    setExpanded(false);
  };

  const itemsToShow = expanded
    ? currentItems
    : currentItems.slice(0, visibleCount);

  const tilesToShow = categoryTiles.map((c) => ({
    name: c.name,
    image: c.image,
  }));

  const getOfferTitle = (offer) => {
    if (offer.discountType === "percentage") {
      return `${offer.discountValue}% OFF`;
    }

    return `Rs ${offer.discountValue} OFF`;
  };

  return (
    <>
      <section className="hero-section">
        <div className="hero">
          <div className="hero-slider">
            <div
              className="hero-slider-track"
              style={{
                transform: `translateX(-${heroSlide * 100}%)`,

                transition: noTransition
                  ? "none"
                  : "transform 0.7s ease-in-out",
              }}
              onTransitionEnd={handleHeroTransitionEnd}
            >
              {heroSlides.map((img, idx) => (
                <div
                  key={idx}
                  className="hero-slide"
                  style={{
                    backgroundImage: `url(${getImageUrl(img)})`,
                  }}
                />
              ))}
            </div>

            <div className="hero-dots">
              {HERO_IMAGES.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`hero-dot ${
                    heroSlide % HERO_IMAGES.length === idx ? "active" : ""
                  }`}
                  onClick={() => setHeroSlide(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          <main className="hero-content">
            <h2>
              Delicious food
              <br />
              delivered to your doorstep
            </h2>

            <p>
              Welcome to our Food Ordering Website, where convenience meets
              great taste. Our platform allows you to explore a wide variety of
              delicious food items, view restaurant details, and place your
              orders quickly and easily.
              <br />
              Designed using modern web technologies, the website offers a
              smooth,
              <br />
              responsive, and user-friendly experience across all devices.
            </p>

            <button className="hero-btn">
              <a href="#Explore-Menu">
                <b>View Menu</b>
              </a>
            </button>
          </main>
        </div>
      </section>

      {!offersLoading && offers.length > 0 && (
        <section className="offers-section" id="offers">
          <div className="offers-heading">
            <span>🔥 Hot Deals</span>

            <h2>Special Offers</h2>

            <p>Save more on your favourite food today!</p>
          </div>

          <div className="offers-grid">
            {offers.map((offer) => (
              <article className="offer-card" key={offer._id}>
                <div className="offer-icon">🎁</div>

                <div className="offer-content">
                  <span className="offer-code">{offer.code}</span>

                  <h3>{getOfferTitle(offer)}</h3>

                  <p>
                    {offer.discountType === "percentage"
                      ? `Get ${offer.discountValue}% off your order`
                      : `Get Rs ${offer.discountValue} off your order`}
                  </p>

                  <div className="offer-details">
                    {offer.minOrderValue > 0 && (
                      <span>Min. order Rs {offer.minOrderValue}</span>
                    )}

                    {offer.maxDiscount &&
                      offer.discountType === "percentage" && (
                        <span>Max saving Rs {offer.maxDiscount}</span>
                      )}
                  </div>

                  <a href="#Explore-Menu" className="offer-button">
                    Order Now →
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="show-item">
        <h2>Trending Food Items</h2>

        <div className="horizontal-scroll">
          <div className="scroll-track">
            {[...TRENDING, ...TRENDING].map((item, idx) => (
              <div className="food-card" key={idx}>
                <img src={getImageUrl(item.img)} alt={item.name} />

                <h3>{item.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr className="hr" />

      <section className="menu" id="Explore-Menu">
        <h2 className="menu-heading">Explore Our Menu</h2>

        <div className="menu-categories">
          {tilesToShow.map((tile) => (
            <div
              key={tile.name}
              className={`category-item ${
                activeCategory === tile.name ? "active" : ""
              }`}
              onClick={() => toggleCategory(tile.name)}
            >
              <img src={getImageUrl(tile.image)} alt={tile.name} />

              <h3>{tile.name}</h3>
            </div>
          ))}
        </div>

        <hr className="hr" />

        <h2 className="category-title">
          {activeCategory ? `Showing: ${activeCategory}` : "Showing: All"}
        </h2>

        <div className="food-items">
          {loading
            ? Array.from({
                length: visibleCount,
              }).map((_, i) => (
                <div className="food-item skeleton-card" key={i}>
                  <div className="skeleton-block skeleton-img" />

                  <div
                    className="skeleton-block skeleton-line"
                    style={{
                      width: "70%",
                    }}
                  />

                  <div
                    className="skeleton-block skeleton-line"
                    style={{
                      width: "40%",
                    }}
                  />

                  <div
                    className="skeleton-block skeleton-line"
                    style={{
                      width: "90%",
                    }}
                  />
                </div>
              ))
            : itemsToShow.map((item) => (
                <FoodCard item={item} key={item._id} />
              ))}
        </div>

        {!loading && currentItems.length > visibleCount && (
          <div className="see-all-wrapper">
            <button
              className="see-all-btn"
              onClick={() => setExpanded((v) => !v)}
            >
              {expanded ? "Show Less" : "See All"}
            </button>
          </div>
        )}
      </section>

      {recommended.length > 0 && (
        <section className="recommended-row">
          <h2>Recommended for You</h2>

          <div className="food-grid">
            {recommended.map((food) => (
              <FoodCard item={food} key={food._id} />
            ))}
          </div>
        </section>
      )}

      <section className="app-download" id="app-download">
        <p>
          For Better Experience Download
          <br />
          ZestyBite App
        </p>

        <div className="app-download-platform">
          <img src="/images/assets/play_store.png" alt="play_store" />

          <img src="/images/assets/app_store.png" alt="app_store" />
        </div>
      </section>
    </>
  );
}
