/* ==========================================
   CAMPUS PORTAL - MAIN JAVASCRIPT
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    /* ==========================================
       SPLASH SCREEN
    ========================================== */

    const splash = document.getElementById("splash");

    if (splash) {
        const hideSplash = () => {
            splash.classList.add("is-leaving");
            document.body.classList.remove("splash-active");

            window.setTimeout(() => {
                splash.remove();
            }, 650);
        };

        window.setTimeout(hideSplash, 2200);
    }

    /* ==========================================
       ELEMENTS
    ========================================== */

    const noticeList = document.getElementById("noticeList");
    const noticeForm = document.getElementById("noticeForm");
    const searchInput = document.getElementById("search");
    const loginLink = document.querySelector(".navbar li:last-child a");

    /* ==========================================
       CAMPUS HIGHLIGHTS CAROUSEL
    ========================================== */

    const carousel = document.getElementById("campusCarousel");

    if (carousel && carousel.dataset.initialized !== "true") {
        const slides = Array.from(carousel.querySelectorAll(".carousel-slide"));
        const indicators = Array.from(carousel.querySelectorAll(".carousel-indicator"));

        if (slides.length > 0) {
            carousel.dataset.initialized = "true";

            const previousButton = carousel.querySelector(".carousel-previous");
            const nextButton = carousel.querySelector(".carousel-next");
            const slideInterval = 5000;
            let activeSlide = slides.findIndex(slide => slide.classList.contains("is-active"));
            let autoplayTimer = null;
            let isHovered = false;

            if (activeSlide < 0) {
                activeSlide = 0;
            }

            function displaySlide(index) {
                activeSlide = (index + slides.length) % slides.length;

                slides.forEach((slide, slideIndex) => {
                    const isActive = slideIndex === activeSlide;

                    slide.classList.toggle("is-active", isActive);
                    slide.setAttribute("aria-hidden", String(!isActive));
                });

                indicators.forEach((indicator, indicatorIndex) => {
                    const isActive = indicatorIndex === activeSlide;

                    indicator.classList.toggle("is-active", isActive);
                    indicator.setAttribute("aria-pressed", String(isActive));
                });
            }

            function clearAutoplay() {
                if (autoplayTimer !== null) {
                    window.clearTimeout(autoplayTimer);
                    autoplayTimer = null;
                }
            }

            function scheduleAutoplay() {
                clearAutoplay();

                if (slides.length < 2 || isHovered || document.hidden) {
                    return;
                }

                autoplayTimer = window.setTimeout(() => {
                    autoplayTimer = null;
                    displaySlide(activeSlide + 1);
                    scheduleAutoplay();
                }, slideInterval);
            }

            function navigateToSlide(index) {
                displaySlide(index);
                scheduleAutoplay();
            }

            if (previousButton) {
                previousButton.addEventListener("click", () => {
                    navigateToSlide(activeSlide - 1);
                });
            }

            if (nextButton) {
                nextButton.addEventListener("click", () => {
                    navigateToSlide(activeSlide + 1);
                });
            }

            indicators.forEach((indicator, index) => {
                indicator.addEventListener("click", () => {
                    if (index < slides.length) {
                        navigateToSlide(index);
                    }
                });

                if (index >= slides.length) {
                    indicator.hidden = true;
                }
            });

            carousel.addEventListener("mouseenter", () => {
                isHovered = true;
                clearAutoplay();
            });

            carousel.addEventListener("mouseleave", () => {
                isHovered = false;
                scheduleAutoplay();
            });

            carousel.addEventListener("keydown", event => {
                if (event.key === "ArrowLeft") {
                    event.preventDefault();
                    navigateToSlide(activeSlide - 1);
                } else if (event.key === "ArrowRight") {
                    event.preventDefault();
                    navigateToSlide(activeSlide + 1);
                }
            });

            document.addEventListener("visibilitychange", () => {
                if (document.hidden) {
                    clearAutoplay();
                } else {
                    scheduleAutoplay();
                }
            });

            displaySlide(activeSlide);
            scheduleAutoplay();
        }
    }

    /* ==========================================
       SAMPLE CAMPUS NOTICES
    ========================================== */

    const defaultNotices = [
        {
            id: 1,
            title: "Enrollment Reminder",
            message: "Students are reminded to complete their enrollment requirements before the deadline.",
            date: new Date().toISOString()
        },
        {
            id: 2,
            title: "Project Submission",
            message: "Submit your academic projects to your respective teachers on or before the deadline.",
            date: new Date().toISOString()
        },
        {
            id: 3,
            title: "Upcoming Examination",
            message: "Please prepare for the upcoming examinations and review your lessons.",
            date: new Date().toISOString()
        }
    ];

    let notices = loadNotices();

    /* ==========================================
       LOAD NOTICES FROM STORAGE
    ========================================== */

    function loadNotices() {
        try {
            const savedNotices = localStorage.getItem("campusNotices");

            if (savedNotices !== null) {
                const parsed = JSON.parse(savedNotices);

                if (Array.isArray(parsed)) {
                    return parsed;
                }
            }
        } catch (error) {
            console.error("Unable to load notices:", error);
        }

        return defaultNotices;
    }

    function saveNotices() {
        try {
            localStorage.setItem("campusNotices", JSON.stringify(notices));
        } catch (error) {
            console.error("Unable to save notices:", error);
            showToast("Unable to save notices in this browser.");
        }
    }

    /* ==========================================
       DISPLAY NOTICES
    ========================================== */

    function displayNotices(noticeData) {

        noticeList.replaceChildren();

        if (noticeData.length === 0) {
            const emptyMessage = document.createElement("p");

            emptyMessage.className = "empty-message";
            emptyMessage.textContent = "No notices found.";

            noticeList.appendChild(emptyMessage);
            return;
        }

        noticeData.forEach(notice => {

            const noticeBox = document.createElement("article");
            noticeBox.className = "image-box text-notice";

            const info = document.createElement("div");
            info.className = "notice-info";

            const title = document.createElement("h3");
            title.textContent = notice.title;

            const message = document.createElement("p");
            message.textContent = notice.message;

            const date = document.createElement("small");
            date.className = "notice-date";
            date.textContent = formatDate(notice.date);

            info.append(title, message, date);
            noticeBox.appendChild(info);
            noticeList.appendChild(noticeBox);

        });
    }

    /* ==========================================
       FORMAT DATE
    ========================================== */

    function formatDate(dateValue) {

        const date = new Date(dateValue);

        if (isNaN(date.getTime())) {
            return "Date unavailable";
        }

        return date.toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric"
        });
    }

    /* ==========================================
       SEARCH NOTICES
    ========================================== */

    if (searchInput) {

        searchInput.addEventListener("input", () => {

            const searchTerm = searchInput.value.trim().toLowerCase();

            const filteredNotices = notices.filter(notice =>
                notice.title.toLowerCase().includes(searchTerm) ||
                notice.message.toLowerCase().includes(searchTerm)
            );

            displayNotices(filteredNotices);

        });

    }

    /* ==========================================
       POST A NOTICE
    ========================================== */

    if (noticeForm) {

        noticeForm.addEventListener("submit", event => {

            event.preventDefault();

            const titleInput = document.getElementById("title");
            const messageInput = document.getElementById("message");

            const title = titleInput.value.trim();
            const message = messageInput.value.trim();

            if (!title || !message) {
                showToast("Please fill in all fields.");
                return;
            }

            const newNotice = {
                id: Date.now(),
                title: title,
                message: message,
                date: new Date().toISOString()
            };

            notices.unshift(newNotice);

            saveNotices();
            displayNotices(notices);

            noticeForm.reset();

            if (searchInput) {
                searchInput.value = "";
            }

            showToast("Notice posted successfully!");

        });

    }

    /* ==========================================
       DARK MODE BUTTON
    ========================================== */

    const themeButton = document.createElement("button");

    themeButton.id = "themeToggle";
    themeButton.type = "button";
    themeButton.className = "theme-toggle";
    themeButton.setAttribute("aria-label", "Switch to dark mode");
    themeButton.title = "Switch to dark mode";

    document.querySelector(".header").appendChild(themeButton);

    function applyTheme(theme) {

        const isDark = theme === "dark";

        document.body.classList.toggle("dark-mode", isDark);

        const nextThemeLabel = isDark ? "Switch to light mode" : "Switch to dark mode";
        themeButton.setAttribute("aria-label", nextThemeLabel);
        themeButton.setAttribute("aria-pressed", String(isDark));
        themeButton.title = nextThemeLabel;
        themeButton.innerHTML = isDark
            ? `<svg viewBox="0 0 24 24" aria-hidden="true">
                   <circle cx="12" cy="12" r="4"></circle>
                   <path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"></path>
               </svg>`
            : `<svg viewBox="0 0 24 24" aria-hidden="true">
                   <path d="M20.2 15.4A8.5 8.5 0 0 1 8.6 3.8 8.5 8.5 0 1 0 20.2 15.4Z"></path>
               </svg>`;

        try {
            localStorage.setItem("campusTheme", theme);
        } catch (error) {
            console.warn("Unable to save theme preference:", error);
        }
    }

    let savedTheme = "light";

    try {
        savedTheme = localStorage.getItem("campusTheme") === "dark" ? "dark" : "light";
    } catch (error) {
        console.warn("Unable to read theme preference:", error);
    }

    applyTheme(savedTheme);

    themeButton.addEventListener("click", () => {

        const isDark = document.body.classList.contains("dark-mode");

        applyTheme(isDark ? "light" : "dark");

    });

    /* ==========================================
       LOGIN MODAL
    ========================================== */

    const loginModal = document.createElement("div");

    loginModal.id = "loginModal";
    loginModal.className = "login-modal";

    loginModal.innerHTML = `
        <div class="login-card" role="dialog" aria-modal="true" aria-labelledby="loginTitle">

            <button type="button" class="close-login" aria-label="Close login">&times;</button>

            <div class="auth-view" id="loginView">
                <div class="login-icon">🎓</div>

                <h2 id="loginTitle">Campus Portal Login</h2>

                <p class="login-description">
                    Sign in to access your campus account.
                </p>

                <form id="loginForm">

                    <label for="loginUsername">Username or Email</label>

                    <input
                        type="text"
                        id="loginUsername"
                        placeholder="Enter username or email"
                        autocomplete="username"
                        required
                    >

                    <label for="loginPassword">Password</label>

                    <div class="password-wrapper">

                        <input
                            type="password"
                            id="loginPassword"
                            placeholder="Enter password"
                            autocomplete="current-password"
                            required
                        >

                        <button
                            type="button"
                            id="showPassword"
                            class="show-password"
                        >Show</button>

                    </div>

                    <p id="loginMessage" class="login-message" role="status"></p>

                    <button type="submit" class="login-submit">
                        Log In
                    </button>

                </form>

                <p class="auth-switch-copy">
                    New to Campus Portal?
                    <button type="button" id="showSignup" class="auth-switch">Create an account</button>
                </p>

                <p class="demo-credentials">
                    Demo account:<br>
                    <strong>student@campus.edu</strong><br>
                    <strong>campus123</strong>
                </p>
            </div>

            <div class="auth-view" id="signupView" hidden>
                <div class="login-icon">🎓</div>

                <h2 id="signupTitle">Create an account</h2>

                <p class="login-description">
                    Fill in your details to get started.
                </p>

                <form id="signupForm">

                    <label for="signupName">Full Name</label>
                    <input
                        type="text"
                        id="signupName"
                        placeholder="Enter your full name"
                        autocomplete="name"
                        maxlength="100"
                        required
                    >

                    <label for="signupEmail">Email Address</label>
                    <input
                        type="email"
                        id="signupEmail"
                        placeholder="Enter your email"
                        autocomplete="email"
                        required
                    >

                    <label for="signupPassword">Password</label>
                    <input
                        type="password"
                        id="signupPassword"
                        placeholder="Create a password"
                        autocomplete="new-password"
                        minlength="8"
                        required
                    >

                    <label for="signupConfirmPassword">Confirm Password</label>
                    <input
                        type="password"
                        id="signupConfirmPassword"
                        placeholder="Re-enter your password"
                        autocomplete="new-password"
                        minlength="8"
                        required
                    >

                    <p id="signupMessage" class="login-message" role="status"></p>

                    <button type="submit" class="login-submit">
                        Create Account
                    </button>

                </form>

                <p class="auth-switch-copy">
                    Already have an account?
                    <button type="button" id="backToLogin" class="auth-switch">Log in</button>
                </p>
                <p class="signup-notice">Account registration is not enabled yet.</p>
            </div>
        </div>
    `;
themebutton.id
themebutton.id
Ghieric
document.body.appendChild(loginModal);

    const loginView = document.getElementById("loginView");
    const signupView = document.getElementById("signupView");
    const loginDialog = loginModal.querySelector(".login-card");
    const signupForm = document.getElementById("signupForm");

    function showLoginView() {
        loginView.hidden = false;
        signupView.hidden = true;
        loginDialog.setAttribute("aria-labelledby", "loginTitle");
        document.getElementById("signupMessage").textContent = "";
    }

    function showSignupView() {
        loginView.hidden = true;
        signupView.hidden = false;
        loginDialog.setAttribute("aria-labelledby", "signupTitle");
        document.getElementById("signupName").focus();
    }

    document.getElementById("showSignup").addEventListener("click", showSignupView);
    document.getElementById("backToLogin").addEventListener("click", showLoginView);

    signupForm.addEventListener("submit", event => {
        event.preventDefault();

        const password = document.getElementById("signupPassword").value;
        const confirmPassword = document.getElementById("signupConfirmPassword").value;
        const signupMessage = document.getElementById("signupMessage");

        if (password !== confirmPassword) {
            signupMessage.textContent = "Passwords do not match.";
            signupMessage.className = "login-message error";
            return;
        }

        signupMessage.textContent = "Account creation is not connected yet. Please contact the campus office.";
        signupMessage.className = "login-message";
    });

    /* ==========================================
       OPEN LOGIN
    ========================================== */

    function openLogin() {

        showLoginView();
        loginModal.classList.add("active");

        document.getElementById("loginUsername").focus();

        document.getElementById("loginMessage").textContent = "";

    }

    /* ==========================================
       CLOSE LOGIN
    ========================================== */

    function closeLogin() {

        loginModal.classList.remove("active");

        document.getElementById("loginForm").reset();
        signupForm.reset();
        showLoginView();

        document.getElementById("loginMessage").textContent = "";

    }

    if (loginLink) {

        loginLink.href = "#login";

        loginLink.addEventListener("click", event => {

            event.preventDefault();
            openLogin();

        });

    }

    document.querySelector(".close-login").addEventListener("click", closeLogin);

    loginModal.addEventListener("click", event => {

        if (event.target === loginModal) {
            closeLogin();
        }

    });

    document.addEventListener("keydown", event => {

        if (event.key === "Escape" && loginModal.classList.contains("active")) {
            closeLogin();
        }

    });

    /* ==========================================
       SHOW / HIDE PASSWORD
    ========================================== */

    const passwordInput = document.getElementById("loginPassword");
    const showPasswordButton = document.getElementById("showPassword");

    showPasswordButton.addEventListener("click", () => {

        const isPassword = passwordInput.type === "password";

        passwordInput.type = isPassword ? "text" : "password";

        showPasswordButton.textContent = isPassword ? "Hide" : "Show";

    });

    /* ==========================================
       DEMO LOGIN
    ========================================== */

    const loginForm = document.getElementById("loginForm");

    loginForm.addEventListener("submit", event => {

        event.preventDefault();

        const username = document.getElementById("loginUsername").value.trim();
        const password = passwordInput.value;
        const loginMessage = document.getElementById("loginMessage");

        // DEMONSTRATION ACCOUNT ONLY
        const demoUsername = "student@campus.edu";
        const demoPassword = "campus123";

        if (
            username.toLowerCase() === demoUsername &&
            password === demoPassword
        ) {

            loginMessage.textContent = "Login successful!";
            loginMessage.className = "login-message success";

            try {
                sessionStorage.setItem("campusLoggedIn", "true");
            } catch (error) {
                console.warn("Unable to save login session:", error);
            }

            setTimeout(() => {

                closeLogin();
                showToast("Welcome to the Campus Portal!");

            }, 500);

        } else {

            loginMessage.textContent = "Incorrect username or password.";
            loginMessage.className = "login-message error";

        }

    });

    /* ==========================================
       TOAST MESSAGE
    ========================================== */

    const toast = document.createElement("div");

    toast.id = "campusToast";
    toast.className = "campus-toast";
    toast.setAttribute("role", "status");

    document.body.appendChild(toast);

    let toastTimer;

    function showToast(message) {

        toast.textContent = message;

        toast.classList.add("show");

        clearTimeout(toastTimer);

        toastTimer = setTimeout(() => {
            toast.classList.remove("show");
        }, 3000);

    }

    /* ==========================================
       INITIAL DISPLAY
    ========================================== */

    displayNotices(notices);

});

// SHOW LOGIN SECTION
const loginLink = document.querySelector('a[href="#login"]');
const loginSection = document.getElementById("login");

loginLink.addEventListener("click", function() {
    loginSection.classList.add("active");
});

// BACK TO HOME
document.querySelector(".back-home").addEventListener("click", function() {
    loginSection.classList.remove("active");
});

// SHOW PASSWORD
document.getElementById("showPassword").addEventListener("change", function() {
    document.getElementById("password").type =
        this.checked ? "text" : "password";
});

// LOGIN FORM
document.getElementById("loginForm").addEventListener("submit", function(e) {
    e.preventDefault();

    document.getElementById("loginMessage").textContent =
        "Login form submitted! Connect this form to your authentication system.";
});
