 // Main JavaScript for Nyoni Bot Site
document.addEventListener('DOMContentLoaded', function() {
    // Mobile Navigation Toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
        // Close mobile menu when clicking on a link
        document.querySelectorAll('.nav-menu a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            if (this.getAttribute('href') === '#') return;
            
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#home') {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
                return;
            }
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const offset = 80;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - offset;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Navbar background on scroll
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(17, 24, 39, 0.95)';
            navbar.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.background = 'rgba(31, 41, 55, 0.95)';
            navbar.style.boxShadow = 'none';
        }
    });
    
    // Animate elements on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade');
            }
        });
    }, observerOptions);
    
    // Observe feature cards and steps
    document.querySelectorAll('.feature-card, .step, .pricing-card').forEach(el => {
        observer.observe(el);
    });
    
    // Bot message simulation
    const botMessages = [
        "✅ Bot deployed successfully!",
        "🤖 Bot is now online and responding!",
        "📊 Analytics dashboard updated",
        "🔧 Configuration saved",
        "🚀 Ready to receive commands!"
    ];
    
    let messageIndex = 0;
    const botContent = document.querySelector('.bot-content');
    
    function addBotMessage() {
        if (!botContent) return;
        
        if (messageIndex < botMessages.length) {
            const messageDiv = document.createElement('div');
            messageDiv.className = 'bot-message';
            messageDiv.innerHTML = `
                <div class="avatar">N</div>
                <div class="message">${botMessages[messageIndex]}</div>
            `;
            
            botContent.appendChild(messageDiv);
            botContent.scrollTop = botContent.scrollHeight;
            messageIndex++;
            
            // Add user message after bot message
            if (messageIndex === 1) {
                setTimeout(() => {
                    const userDiv = document.createElement('div');
                    userDiv.className = 'bot-message user';
                    userDiv.innerHTML = `
                        <div class="avatar">U</div>
                        <div class="message">Show me my dashboard</div>
                    `;
                    botContent.appendChild(userDiv);
                    botContent.scrollTop = botContent.scrollHeight;
                }, 1000);
            }
        }
    }
    
    // Start bot messages simulation
    if (botContent) {
        setTimeout(addBotMessage, 1000);
        setInterval(() => {
            if (Math.random() > 0.7 && messageIndex < botMessages.length) {
                addBotMessage();
            }
        }, 3000);
    }
    
    // Initialize particles
    if (typeof particlesJS !== 'undefined') {
        particlesJS('particles-js', {
            particles: {
                number: { value: 80, density: { enable: true, value_area: 800 } },
                color: { value: "#7C3AED" },
                shape: { type: "circle" },
                opacity: { value: 0.3, random: true },
                size: { value: 3, random: true },
                line_linked: {
                    enable: true,
                    distance: 150,
                    color: "#7C3AED",
                    opacity: 0.2,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 2,
                    direction: "none",
                    random: true,
                    straight: false,
                    out_mode: "out",
                    bounce: false
                }
            },
            interactivity: {
                detect_on: "canvas",
                events: {
                    onhover: { enable: true, mode: "repulse" },
                    onclick: { enable: true, mode: "push" },
                    resize: true
                }
            },
            retina_detect: true
        });
    }
    
    // Form validation for login/register
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const inputs = this.querySelectorAll('input[required]');
            let isValid = true;
            
            inputs.forEach(input => {
                if (!input.value.trim()) {
                    isValid = false;
                    input.style.borderColor = '#EF4444';
                } else {
                    input.style.borderColor = '';
                }
                
                // Email validation
                if (input.type === 'email') {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(input.value)) {
                        isValid = false;
                        input.style.borderColor = '#EF4444';
                    }
                }
                
                // Password validation
                if (input.type === 'password' && input.value.length < 6) {
                    isValid = false;
                    input.style.borderColor = '#EF4444';
                    alert('Password must be at least 6 characters long');
                }
            });
            
            if (isValid) {
                // Show success message
                const submitBtn = this.querySelector('button[type="submit"]');
                const originalText = submitBtn.innerHTML;
                
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
                submitBtn.disabled = true;
                
                // Simulate API call
                setTimeout(() => {
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                    
                    // Show success notification
                    showNotification('Success! Redirecting to dashboard...', 'success');
                    
                    // Redirect to dashboard after 2 seconds
                    setTimeout(() => {
                        if (this.id === 'login-form' || this.id === 'register-form') {
                            window.location.href = 'dashboard.html';
                        }
                    }, 2000);
                }, 1500);
            }
        });
    });
    
    // Notification function
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Close button
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        });
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.classList.remove('show');
                setTimeout(() => {
                    notification.remove();
                }, 300);
            }
        }, 5000);
    }
    
    // Add notification styles
    const notificationStyles = document.createElement('style');
    notificationStyles.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--dark);
            color: white;
            padding: 15px 20px;
            border-radius: var(--border-radius-sm);
            box-shadow: var(--shadow-lg);
            display: flex;
            align-items: center;
            gap: 10px;
            transform: translateX(150%);
            transition: transform 0.3s ease;
            z-index: 9999;
            border-left: 4px solid var(--primary);
            max-width: 350px;
        }
        
        .notification.show {
            transform: translateX(0);
        }
        
        .notification.success {
            border-left-color: var(--secondary);
        }
        
        .notification.error {
            border-left-color: #EF4444;
        }
        
        .notification i {
            font-size: 1.2rem;
        }
        
        .notification.success i {
            color: var(--secondary);
        }
        
        .notification.error i {
            color: #EF4444;
        }
        
        .notification-close {
            background: none;
            border: none;
            color: white;
            font-size: 1.5rem;
            cursor: pointer;
            margin-left: auto;
            padding: 0;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0.7;
            transition: opacity 0.2s;
        }
        
        .notification-close:hover {
            opacity: 1;
        }
    `;
    document.head.appendChild(notificationStyles);
});
