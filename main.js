import React, { useEffect, useRef } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import Typed from "typed.js";
import "three.r134.min.js"; // Import Three.js
import "vanta.clouds.min.js"; // Import Vanta.js Clouds effect
import $ from "jquery"; // Import jQuery

const Home = () => {
  const vantaRef = useRef(null);

  useEffect(() => {
    // Smooth scrolling for navigation links
    $("a").on("click", function (event) {
      if (this.hash !== "") {
        event.preventDefault();

        var hash = this.hash;

        $("html, body").animate(
          {
            scrollTop: $(hash).offset().top,
          },
          800,
          function () {
            window.location.hash = hash;
          }
        );
      }
    });

    // Show navbar background on scroll
    $(window).scroll(function () {
      if ($(this).scrollTop() > 50) {
        $(".navbar").addClass("bg-scroll");
      } else {
        $(".navbar").removeClass("bg-scroll");
      }
    });

    // Add shadow to navbar on scroll
    $(window).scroll(function () {
      if ($(this).scrollTop() > 50) {
        $(".navbar").addClass("navbar-shadow");
      } else {
        $(".navbar").removeClass("navbar-shadow");
      }
    });

    // Add animation to scroll-to-top button
    $(window).scroll(function () {
      if ($(this).scrollTop() > 200) {
        $("#scrollToTopBtn").fadeIn();
      } else {
        $("#scrollToTopBtn").fadeOut();
      }
    });

    $("#scrollToTopBtn").click(function () {
      $("html, body").animate({ scrollTop: 0 }, 800);
      return false;
    });

    // Customize AOS settings
    AOS.init({
      duration: 800,
      easing: "ease-in-out",
    });

    // Initialize Typed.js
    const options = {
      strings: [
        "Welcome to my portfolio.",
        "I am a passionate developer.",
        "Let's create something amazing!",
      ],
      typeSpeed: 30,
      backSpeed: 25,
      backDelay: 1500,
      startDelay: 500,
      loop: true,
      showCursor: true,
    };
    const typed = new Typed(".typed-text", options);

    // Initialize Vanta.js Clouds effect
    // ...

    // Cleanup Vanta.js on component unmount
    return () => {
      if (vantaRef.current) {
        vantaRef.current.destroy();
      }
    };
  }, []); // Empty dependency array to run this effect only once

  useEffect(() => {
    // Ensure DOM is ready before manipulating it
    document.addEventListener('DOMContentLoaded', function () {
      // Your existing JavaScript code

      // Add a class to the favicon link for styling
      const faviconLink = document.querySelector('#round-favicon');
      if (faviconLink) {
        faviconLink.classList.add('round-favicon');
      }
    });
  }, []);

  return (
    <div>
      {/* Container for Vanta.js background */}
      <div className="vanta-background"></div>

      {/* Add a container for Typed.js to target */}
      <div className="typed-text"></div>
      {/* Your component JSX goes here */}
    </div>
  );
};

export default Home;
