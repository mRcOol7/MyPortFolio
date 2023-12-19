import React, { useEffect, useRef } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import Typed from "typed.js";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import "firebase/firestore"; // Import Firestore if you need it
import $ from "jquery";
import { SpeedInsights } from "@vercel/speed-insights/react";

// Import analytics inject function
import { inject } from '@vercel/analytics';

const Home = () => {
  const vantaRef = useRef(null);

  // Inject Vercel Analytics
  inject();

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
    document.addEventListener("DOMContentLoaded", function () {
      // Your existing JavaScript code

      // Add a class to the favicon link for styling
      const faviconLink = document.querySelector("#round-favicon");
      if (faviconLink) {
        faviconLink.classList.add("round-favicon");
      }
    });
  }, []);

  useEffect(() => {
    // Firebase initialization code
    const firebaseConfig = {
      apiKey: "YOUR_API_KEY",
      authDomain: "YOUR_AUTH_DOMAIN",
      projectId: "YOUR_PROJECT_ID",
      storageBucket: "YOUR_STORAGE_BUCKET",
      messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
      appId: "YOUR_APP_ID",
      measurementId: "YOUR_MEASUREMENT_ID",
    };

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const analytics = getAnalytics(app);

    // Additional Firebase services can be initialized here
  }, []);

  return (
    <div>
      {/* Container for Vanta.js background */}
      <div className="vanta-background"></div>

      {/* Add a container for Typed.js to target */}
      <div className="typed-text"></div>

      {/* Add SpeedInsights component */}
      <SpeedInsights />

      {/* Your component JSX goes here */}
    </div>
  );
};

export default Home;
