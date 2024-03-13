import React, { useEffect, useState, useRef } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

const Home = () => {
  const [showScrollTopButton, setShowScrollTopButton] = useState(false);
  const navbarRef = useRef(null);

  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: true,
    });

    const handleScroll = () => {
      const position = window.pageYOffset;
      setShowScrollTopButton(position > 200);

      if (navbarRef.current) {
        navbarRef.current.style.backgroundColor = position > 50 ? 'rgba(44, 62, 80, 0.95)' : 'transparent'; // Adjust navbar background dynamically
        const action = position > 50 ? 'add' : 'remove';
        navbarRef.current.classList[action]('bg-scroll', 'navbar-shadow');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    AOS.refresh();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
    AOS.refresh();
  };

  // Updated handleSubmit method with async/await for form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);

    try {
      const response = await fetch('submit_contact_form.php', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Network response was not ok.');
      }

      const data = await response.json();
      if (data.success) {
        alert("Thank you for your message! I'll get back to you soon.");
        form.reset(); // Reset form after successful submission
      } else {
        alert("Oops! There was a problem with your submission. Please try again.");
      }
    } catch (error) {
      console.error('Error:', error);
      alert("There was a problem with your submission: " + error.message);
    }
  };

  return (
    <div>
      <nav ref={navbarRef} className="navbar">
        {/* Enhanced Navbar content here */}
      </nav>

      {/* Enhanced other component content */}

      {showScrollTopButton && (
        <button onClick={scrollToTop} id="scrollToTopBtn" className="scroll-to-top" aria-label="Scroll to top">
          &#8679; Scroll to Top
        </button>
      )}

      <footer data-aos="fade-up">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} Nehal Chauhan. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
