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
      once: true, // Whether animation should happen only once - while scrolling down
    });

    const handleScroll = () => {
      const position = window.pageYOffset;
      setShowScrollTopButton(position > 200);

      if (navbarRef.current) {
        if (position > 50) {
          navbarRef.current.classList.add('bg-scroll', 'navbar-shadow');
        } else {
          navbarRef.current.classList.remove('bg-scroll', 'navbar-shadow');
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Call this in case of dynamic content changes
    AOS.refresh();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
    // Optionally, refresh AOS after scrolling to ensure animations trigger correctly.
    AOS.refresh();
  };

  document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contactForm');
    const successMessage = document.getElementById('successMessage');
  
    form.addEventListener('submit', function(event) {
      event.preventDefault(); // Prevent the default form submission
  
      const formData = new FormData(form);
  
      // Use Fetch API to submit the form data asynchronously
      fetch('submit_contact_form.php', {
        method: 'POST',
        body: formData,
      })
      .then(response => response.json()) // Assuming your PHP script sends back a JSON response
      .then(data => {
        console.log(data); // For debugging purposes, to see the response in the console
        // Check if the submission was successful based on your PHP response
        if (data.success) {
          successMessage.style.display = 'block'; // Show success message
          form.reset(); // Reset the form fields
          // Optionally, hide the success message after a few seconds
          setTimeout(() => {
            successMessage.style.display = 'none';
          }, 5000); // Adjust time as needed
        } else {
          // If the submission was not successful, do nothing or handle as needed
          // In this case, we simply reset the form without showing any alert message
          form.reset();
        }
      })
      .catch(error => {
        console.error('Error:', error);
        // If there's an error, reset the form without showing any alert message
        form.reset();
      });
    });
  });
  
  return (
    <div>
      <nav ref={navbarRef} className="navbar">
        {/* Navbar content here */}
      </nav>

      {/* Other component content */}

      {showScrollTopButton && (
        <button onClick={scrollToTop} id="scrollToTopBtn" style={{ display: 'block' }} aria-label="Scroll to top">
          Scroll to Top
        </button>
      )}

      <footer data-aos="fade-up">
        <div className="container">
          <p>&copy; 2023 Nehal Chauhan. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
