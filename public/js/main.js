// main.js
document.addEventListener('DOMContentLoaded', () => {
    const reviewForm = document.getElementById('reviewForm');
    const openReviewFormButton = document.getElementById('openReviewForm');
    const reviewModal = new bootstrap.Modal(document.getElementById('reviewModal'));
    const ratingStars = document.querySelectorAll('#ratingStars i');
    const ratingInput = document.getElementById('rating');
    let swiper;

    // Initialize Swiper
    function initSwiper() {
        swiper = new Swiper('.swiper', {
            slidesPerView: 1,
            spaceBetween: 30,
            loop: true,
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            autoplay: {
                delay: 5000,
                disableOnInteraction: false,
            },
            effect: 'coverflow',
            coverflowEffect: {
                rotate: 50,
                stretch: 0,
                depth: 100,
                modifier: 1,
                slideShadows: true,
            },
        });
    }

    // Fetch and display reviews
    function fetchReviews() {
        fetch('/api/reviews')
            .then(response => response.json())
            .then(reviews => {
                displayReviews(reviews);
                updateReviewSummary(reviews);
            })
            .catch(error => console.error('Error fetching reviews:', error));
    }

    // Display reviews in the slider
    function displayReviews(reviews) {
        const swiperWrapper = document.querySelector('.swiper-wrapper');
        swiperWrapper.innerHTML = '';

        if (reviews.length === 0) {
            const slide = document.createElement('div');
            slide.className = 'swiper-slide';
            slide.innerHTML = `
                <div class="review-card">
                    <h3>No Reviews Yet</h3>
                    <p>Be the first to leave a review!</p>
                </div>
            `;
            swiperWrapper.appendChild(slide);
        } else {
            reviews.forEach(review => {
                const slide = document.createElement('div');
                slide.className = 'swiper-slide';
                slide.innerHTML = `
                    <div class="review-card">
                        <div class="review-header">
                            <h3>${review.name}</h3>
                            <div class="rating">
                                ${getStarRating(review.rating)}
                            </div>
                        </div>
                        <p class="review-text">${review.review}</p>
                        <div class="review-date">${new Date(review.created_at).toLocaleDateString()}</div>
                    </div>
                `;
                swiperWrapper.appendChild(slide);
            });
        }

        if (swiper) {
            swiper.destroy();
        }
        initSwiper();

        // Add fade-in animation to slides
        gsap.from('.swiper-slide', {
            opacity: 0,
            y: 50,
            duration: 1,
            stagger: 0.2,
            ease: 'power3.out'
        });
    }

    // Update review summary
    function updateReviewSummary(reviews) {
        const totalReviews = reviews.length;
        let sumRatings = 0;
        const ratingCounts = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0};

        reviews.forEach(review => {
            const rating = Math.round(review.rating);
            sumRatings += review.rating;
            ratingCounts[rating]++;
        });

        const averageRating = totalReviews > 0 ? sumRatings / totalReviews : 0;

        // Update overall rating
        document.querySelector('.overall-rating h2').textContent = averageRating.toFixed(1);
        document.querySelector('.overall-rating .star-rating').innerHTML = getStarRating(averageRating);
        document.querySelector('.overall-rating p').textContent = `Based on ${totalReviews} review${totalReviews !== 1 ? 's' : ''}`;

        // Update rating breakdown
        for (let i = 1; i <= 5; i++) {
            const percentage = totalReviews > 0 ? (ratingCounts[i] / totalReviews * 100).toFixed(0) : 0;
            const ratingBar = document.querySelector(`.rating-bar:nth-child(${6-i}) .progress-bar`);
            const ratingPercentage = document.querySelector(`.rating-bar:nth-child(${6-i}) span:last-child`);
            
            ratingBar.style.width = `${percentage}%`;
            ratingBar.setAttribute('aria-valuenow', percentage);
            ratingPercentage.textContent = `${percentage}%`;
        }

        // Animate the changes
        gsap.from('.overall-rating h2, .overall-rating .star-rating, .overall-rating p', {
            opacity: 0,
            y: 20,
            duration: 0.5,
            stagger: 0.1,
            ease: 'power3.out'
        });

        gsap.from('.rating-bar .progress-bar', {
            width: 0,
            duration: 1,
            ease: 'power3.out'
        });
    }

    // Generate star rating HTML
    function getStarRating(rating) {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                stars += '<i class="fas fa-star"></i>';
            } else if (i - 0.5 <= rating) {
                stars += '<i class="fas fa-star-half-alt"></i>';
            } else {
                stars += '<i class="far fa-star"></i>';
            }
        }
        return stars;
    }

    // Handle star rating selection
    ratingStars.forEach(star => {
        star.addEventListener('click', () => {
            const rating = star.getAttribute('data-rating');
            ratingInput.value = rating;
            updateStarRating(rating);
        });

        star.addEventListener('mouseover', () => {
            const rating = star.getAttribute('data-rating');
            updateStarRating(rating, true);
        });

        star.addEventListener('mouseout', () => {
            updateStarRating(ratingInput.value);
        });
    });

    function updateStarRating(rating, hover = false) {
        ratingStars.forEach(star => {
            const starRating = star.getAttribute('data-rating');
            if (starRating <= rating) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });
    }

    // Open review form modal
    openReviewFormButton.addEventListener('click', () => {
        reviewModal.show();
    });

    // Handle form submission
    reviewForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(reviewForm);
        const reviewData = Object.fromEntries(formData.entries());

        fetch('/api/reviews', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(reviewData),
        })
        .then(response => response.json())
        .then(data => {
            console.log('Review submitted:', data);
            reviewModal.hide();
            reviewForm.reset();
            updateStarRating(0);
            fetchReviews();
        })
        .catch(error => console.error('Error submitting review:', error));
    });

    // Initialize the page
    fetchReviews();

    // Animate hero section on load
    gsap.from('.hero-section h1', {
        opacity: 0,
        y: -50,
        duration: 1,
        ease: 'power3.out'
    });

    gsap.from('.hero-section p', {
        opacity: 0,
        y: 50,
        duration: 1,
        delay: 0.3,
        ease: 'power3.out'
    });

    // Animate review summary on scroll
    gsap.from('.review-summary', {
        opacity: 0,
        y: 100,
        duration: 1,
        scrollTrigger: {
            trigger: '.review-summary',
            start: 'top 80%',
        },
        ease: 'power3.out'
    });

    // Animate "Write a Review" button
    gsap.from('#openReviewForm', {
        opacity: 0,
        y: 50,
        duration: 1,
        delay: 0.5,
        ease: 'power3.out'
    });
});

// Server-side code (reviews route)
const express = require('express');
const router = express.Router();
const db = require('../db/db');

router.post('/', async (req, res) => {
  try {
    const { name, email, review, rating } = req.body;
    // Check if any required field is missing or undefined
    if (!name || !email || !review || rating === undefined) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    const [result] = await db.execute(
      'INSERT INTO reviews (name, email, review, rating) VALUES (?, ?, ?, ?)',
      [name, email, review, parseInt(rating, 10)]
    );
    res.status(201).json({ id: result.insertId, message: 'Review submitted successfully' });
  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM reviews ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;