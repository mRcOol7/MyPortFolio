// pages/index.js

import React, { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

const Home = () => {
  useEffect(() => {
    // Smooth scrolling for navigation links
    $("a").on('click', function (event) {
      if (this.hash !== "") {
        event.preventDefault();

        var hash = this.hash;

        $('html, body').animate({
          scrollTop: $(hash).offset().top
        }, 800, function () {
          window.location.hash = hash;
        });
      }
    });

    // Show navbar background on scroll
    $(window).scroll(function () {
      if ($(this).scrollTop() > 50) {
        $('.navbar').addClass('bg-scroll');
      } else {
        $('.navbar').removeClass('bg-scroll');
      }
    });

    // Add shadow to navbar on scroll
    $(window).scroll(function () {
      if ($(this).scrollTop() > 50) {
        $('.navbar').addClass('navbar-shadow');
      } else {
        $('.navbar').removeClass('navbar-shadow');
      }
    });

    // Add animation to scroll-to-top button
    $(window).scroll(function () {
      if ($(this).scrollTop() > 200) {
        $('#scrollToTopBtn').fadeIn();
      } else {
        $('#scrollToTopBtn').fadeOut();
      }
    });

    $('#scrollToTopBtn').click(function () {
      $('html, body').animate({ scrollTop: 0 }, 800);
      return false;
    });

    // Customize AOS settings
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
    });
  }, []); // Empty dependency array to run this effect only once

  return (
    <div>
      {/* Your component JSX goes here */}
    </div>
  );
};

export default Home;
