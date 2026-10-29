/**
 * CareerConnect - Authentication & Dynamic Navigation Manager
 */

function getCurrentUser() {
  return UserSession.get();
}

function isLoggedIn() {
  return !!AuthToken.get() && !!UserSession.get();
}

function getUserRole() {
  const user = getCurrentUser();
  return user ? user.role : null;
}

/**
 * Route Guard: Protect pages by required role
 */
function requireAuth(allowedRoles = []) {
  if (!isLoggedIn()) {
    const currentPath = window.location.pathname;
    window.location.href = `/login.html?redirect=${encodeURIComponent(currentPath)}`;
    return false;
  }

  const role = getUserRole();
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    // Redirect to user's proper dashboard if wrong role
    if (role === 'student') window.location.href = '/student-dashboard.html';
    else if (role === 'employer') window.location.href = '/employer-dashboard.html';
    else if (role === 'admin') window.location.href = '/admin-dashboard.html';
    else window.location.href = '/';
    return false;
  }

  return true;
}

/**
 * User Logout
 */
async function logout() {
  try {
    await apiRequest('/auth/logout', { method: 'POST' });
  } catch (err) {
    console.warn('Logout API call failed:', err);
  } finally {
    AuthToken.remove();
    UserSession.remove();
    showToast('Logged out successfully', 'info');
    setTimeout(() => {
      window.location.href = '/login.html';
    }, 600);
  }
}

/**
 * Render Responsive Navigation Bar
 */
function renderNavbar() {
  const header = document.getElementById('main-header');
  if (!header) return;

  const user = getCurrentUser();
  const currentPath = window.location.pathname;

  let roleLinks = '';
  let authContent = '';

  if (user) {
    if (user.role === 'student') {
      roleLinks = `
        <li><a href="/jobs.html" class="${currentPath.includes('jobs.html') ? 'active' : ''}">Browse Jobs</a></li>
        <li><a href="/internships.html" class="${currentPath.includes('internships.html') ? 'active' : ''}">Internships</a></li>
        <li><a href="/student-dashboard.html" class="${currentPath.includes('student-dashboard') ? 'active' : ''}">Dashboard</a></li>
        <li><a href="/applications.html" class="${currentPath.includes('applications') ? 'active' : ''}">My Applications</a></li>
        <li><a href="/saved-jobs.html" class="${currentPath.includes('saved-jobs') ? 'active' : ''}">Saved Jobs</a></li>
        <li><a href="/profile.html" class="${currentPath.includes('profile') ? 'active' : ''}">Profile</a></li>
        <li><a href="/resume-upload.html" class="${currentPath.includes('resume-upload') ? 'active' : ''}">Resumes</a></li>
      `;
    } else if (user.role === 'employer') {
      roleLinks = `
        <li><a href="/employer-dashboard.html" class="${currentPath.includes('employer-dashboard') ? 'active' : ''}">Dashboard</a></li>
        <li><a href="/post-job.html" class="${currentPath.includes('post-job') ? 'active' : ''}">+ Post a Job</a></li>
        <li><a href="/manage-jobs.html" class="${currentPath.includes('manage-jobs') ? 'active' : ''}">Manage Jobs</a></li>
        <li><a href="/applicants.html" class="${currentPath.includes('applicants') ? 'active' : ''}">View Applicants</a></li>
        <li><a href="/jobs.html" class="${currentPath.includes('jobs.html') ? 'active' : ''}">All Jobs</a></li>
      `;
    } else if (user.role === 'admin') {
      roleLinks = `
        <li><a href="/admin-dashboard.html" class="${currentPath.includes('admin-dashboard') ? 'active' : ''}">Admin Console</a></li>
        <li><a href="/jobs.html" class="${currentPath.includes('jobs.html') ? 'active' : ''}">Browse Jobs</a></li>
        <li><a href="/internships.html" class="${currentPath.includes('internships.html') ? 'active' : ''}">Internships</a></li>
      `;
    }

    const firstLetter = user.name ? user.name.charAt(0).toUpperCase() : 'U';
    authContent = `
      <div class="user-pill">
        <div class="avatar-initial">${firstLetter}</div>
        <span>${escapeHtml(user.name)}</span>
        <span class="badge badge-primary" style="font-size:0.7rem;">${user.role}</span>
      </div>
      <button class="btn btn-outline btn-sm" onclick="logout()">Log Out</button>
    `;
  } else {
    // Visitor navigation
    roleLinks = `
      <li><a href="/jobs.html" class="${currentPath.includes('jobs.html') ? 'active' : ''}">Browse Jobs</a></li>
      <li><a href="/internships.html" class="${currentPath.includes('internships.html') ? 'active' : ''}">Internships</a></li>
      <li><a href="/about.html" class="${currentPath.includes('about') ? 'active' : ''}">About Us</a></li>
      <li><a href="/contact.html" class="${currentPath.includes('contact') ? 'active' : ''}">Contact</a></li>
    `;
    authContent = `
      <a href="/login.html" class="btn btn-outline btn-sm">Log In</a>
      <a href="/register.html" class="btn btn-primary btn-sm">Sign Up</a>
    `;
  }

  header.innerHTML = `
    <nav class="navbar">
      <div class="container navbar-inner">
        <a href="/" class="brand-logo" aria-label="CareerConnect Home">
          <img src="/images/logo.png" alt="CareerConnect - Jobs, Internships, Your Future" class="brand-logo-img">
        </a>

        <ul class="nav-links" id="nav-links-menu">
          ${roleLinks}
        </ul>

        <div class="nav-auth">
          ${authContent}
          <button class="mobile-toggle" id="mobile-toggle-btn" aria-label="Toggle navigation menu">☰</button>
        </div>
      </div>
    </nav>
  `;

  // Attach mobile toggle
  const toggleBtn = document.getElementById('mobile-toggle-btn');
  const navMenu = document.getElementById('nav-links-menu');
  if (toggleBtn && navMenu) {
    toggleBtn.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });
  }
}

/**
 * Render Universal Footer
 */
function renderFooter() {
  const footer = document.getElementById('main-footer');
  if (!footer) return;

  footer.innerHTML = `
    <footer class="footer">
      <div class="container">
        <div class="footer-grid">
          <div>
            <div class="brand-logo" style="margin-bottom:0.75rem;">
              <img src="/images/logo.png" alt="CareerConnect - Jobs, Internships, Your Future" class="brand-logo-img">
            </div>
            <p class="footer-desc">
              Empowering students, fresh graduates, and ambitious professionals with smart job matches, internship opportunities, and career acceleration tools.
            </p>
          </div>

          <div>
            <h4 class="footer-heading">For Job Seekers</h4>
            <ul class="footer-links">
              <li><a href="/jobs.html">Browse All Jobs</a></li>
              <li><a href="/internships.html">Browse Internships</a></li>
              <li><a href="/student-dashboard.html">Student Dashboard</a></li>
              <li><a href="/resume-upload.html">Resume Builder & Upload</a></li>
              <li><a href="/applications.html">Application Tracking</a></li>
            </ul>
          </div>

          <div>
            <h4 class="footer-heading">For Employers</h4>
            <ul class="footer-links">
              <li><a href="/post-job.html">Post an Opportunity</a></li>
              <li><a href="/employer-dashboard.html">Employer Dashboard</a></li>
              <li><a href="/manage-jobs.html">Manage Job Postings</a></li>
              <li><a href="/applicants.html">Review Candidates</a></li>
            </ul>
          </div>

          <div>
            <h4 class="footer-heading">Platform & Help</h4>
            <ul class="footer-links">
              <li><a href="/about.html">About CareerConnect</a></li>
              <li><a href="/contact.html">Contact Support & FAQ</a></li>
              <li><a href="/admin-dashboard.html">Admin Portal</a></li>
              <li><a href="/login.html">Sign In</a></li>
            </ul>
          </div>
        </div>

        <div class="footer-bottom">
          <p>© 2026 CareerConnect – Smart Job and Internship Finder Portal. Full-Stack Web Application.</p>
          <p>Built with Node.js, Express, MongoDB & Pure JavaScript.</p>
        </div>
      </div>
    </footer>
  `;
}

// Auto initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  renderNavbar();
  renderFooter();
});

