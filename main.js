import React, { useEffect, useState, useRef } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import Typed from "typed.js";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { inject } from '@vercel/analytics';

const Home = () => {
  const [showScrollTopButton, setShowScrollTopButton] = useState(false);
  const navbarRef = useRef(null);

  useEffect(() => {
    // Inject Vercel Analytics
    inject();

    const handleScroll = () => {
      const position = window.pageYOffset;
      setShowScrollTopButton(position > 200);

      if (navbarRef.current) {
        if (position > 50) {
          navbarRef.current.classList.add("bg-scroll", "navbar-shadow");
        } else {
          navbarRef.current.classList.remove("bg-scroll", "navbar-shadow");
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    AOS.init({
      duration: 800,
      easing: "ease-in-out",
    });


    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div>
      <nav ref={navbarRef} className="navbar">
        {/* Navbar content here */}
      </nav>

      <div className="typed-text"></div>

      <SpeedInsights />

      {showScrollTopButton && (
        <button onClick={scrollToTop} id="scrollToTopBtn" style={{ display: "block" }} aria-label="Scroll to top">
          Scroll to Top
        </button>
      )}

      <InteractiveFeature />
    </div>
  );
};

const InteractiveFeature = () => {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)} aria-label="Increment counter">
        Click me
      </button>
    </div>
  );
};

export default Home;
