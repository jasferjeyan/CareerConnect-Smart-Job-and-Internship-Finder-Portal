/**
 * CareerConnect - Student Dashboard & Recommendations
 */

async function initStudentDashboard() {
  if (!requireAuth(['student'])) return;

  const user = getCurrentUser();
  const welcomeEl = document.getElementById('student-welcome-name');
  if (welcomeEl && user) {
    welcomeEl.textContent = user.name;
  }

  loadDashboardStatsAndProfile();
  loadRecommendedJobs();
}

async function loadDashboardStatsAndProfile() {
  try {
    const [profileRes, appsRes, savedRes] = await Promise.all([
      apiRequest('/profile'),
      apiRequest('/applications/me'),
      apiRequest('/saved-jobs')
    ]);

    const profile = profileRes.profile || {};
    const applications = appsRes.applications || [];
    const savedJobs = savedRes.savedJobs || [];

    // Stats
    const totalAppsEl = document.getElementById('stat-total-apps');
    const shortlistedEl = document.getElementById('stat-shortlisted');
    const savedCountEl = document.getElementById('stat-saved-count');
    const skillsCountEl = document.getElementById('stat-skills-count');

    if (totalAppsEl) totalAppsEl.textContent = applications.length;
    if (shortlistedEl) {
      const shortlistedCount = applications.filter(
        (a) => a.status === 'Shortlisted' || a.status === 'Selected'
      ).length;
      shortlistedEl.textContent = shortlistedCount;
    }
    if (savedCountEl) savedCountEl.textContent = savedJobs.length;
    if (skillsCountEl) skillsCountEl.textContent = (profile.skills || []).length;

    // Profile summary card
    const summaryCollege = document.getElementById('summary-college');
    const summaryDegree = document.getElementById('summary-degree');
    const summarySkillsList = document.getElementById('summary-skills-list');

    if (summaryCollege) summaryCollege.textContent = profile.college || 'College not added yet';
    if (summaryDegree) summaryDegree.textContent = profile.degree || 'Degree not specified';
    if (summarySkillsList) {
      if (profile.skills && profile.skills.length > 0) {
        summarySkillsList.innerHTML = profile.skills
          .slice(0, 6)
          .map((s) => `<span class="skill-tag matched">${escapeHtml(s)}</span>`)
          .join('');
      } else {
        summarySkillsList.innerHTML = '<span style="font-size:0.85rem; color:var(--text-muted);">No skills listed. Click "Update Profile" to get smart job recommendations!</span>';
      }
    }

    // Recent applications list
    const recentAppsContainer = document.getElementById('recent-apps-container');
    if (recentAppsContainer) {
      if (applications.length === 0) {
        recentAppsContainer.innerHTML = `
          <div style="text-align:center; padding:1.5rem; color:var(--text-muted); font-size:0.9rem;">
            No applications submitted yet. Browse jobs to get started!
          </div>
        `;
      } else {
        recentAppsContainer.innerHTML = `
          <div style="display:flex; flex-direction:column; gap:0.75rem;">
            ${applications
              .slice(0, 4)
              .map((app) => {
                const job = app.jobId;
                if (!job) return '';
                return `
                  <div style="display:flex; justify-content:space-between; align-items:center; padding:0.75rem; background:var(--bg-subtle); border-radius:var(--radius-md);">
                    <div>
                      <a href="/job-details.html?id=${job._id}" style="font-weight:700; color:var(--text-main); font-size:0.95rem;">
                        ${escapeHtml(job.title)}
                      </a>
                      <div style="font-size:0.8rem; color:var(--text-muted);">
                        ${escapeHtml(job.companyName)} &bull; ${formatDate(app.appliedAt)}
                      </div>
                    </div>
                    <div>
                      ${getStatusBadge(app.status)}
                    </div>
                  </div>
                `;
              })
              .join('')}
          </div>
        `;
      }
    }
  } catch (err) {
    showToast('Failed to load dashboard data: ' + err.message, 'error');
  }
}

async function loadRecommendedJobs() {
  const container = document.getElementById('recommended-jobs-container');
  if (!container) return;

  container.innerHTML = `
    <div style="text-align:center; padding:2rem; color:var(--text-muted);">
      Computing skill matches from your profile...
    </div>
  `;

  try {
    const res = await apiRequest('/jobs/recommended');
    const recommendations = res.recommendations || [];

    if (recommendations.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">💡</div>
          <h4 class="empty-title">Add Skills for Recommendations</h4>
          <p class="empty-text">Add technical skills like JavaScript, Python, React, or SQL to your profile to get automated matching jobs!</p>
          <a href="/profile.html" class="btn btn-primary btn-sm">Update Profile Skills</a>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap:1.25rem;">
        ${recommendations
          .slice(0, 4)
          .map((job) => {
            return `
              <div class="card card-interactive" style="display:flex; flex-direction:column; justify-content:space-between;">
                <div>
                  <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.5rem;">
                    <div>
                      <h4 style="font-size:1.05rem; font-weight:700;">${escapeHtml(job.title)}</h4>
                      <div style="font-size:0.85rem; color:var(--primary); font-weight:600;">${escapeHtml(job.companyName)}</div>
                    </div>
                    <span class="badge badge-success" style="font-size:0.8rem; font-weight:700;">
                      🎯 ${job.matchPercentage}% Match
                    </span>
                  </div>

                  <div class="job-meta-list" style="margin:0.5rem 0; font-size:0.8rem;">
                    <span>📍 ${escapeHtml(job.location)}</span>
                    <span>💼 ${escapeHtml(job.jobType)}</span>
                  </div>

                  <div style="margin: 0.6rem 0;">
                    <span style="font-size:0.75rem; font-weight:600; color:var(--text-muted);">Matching Skills:</span>
                    <div class="skills-wrap" style="margin:0.25rem 0;">
                      ${(job.matchingSkills || []).map((s) => `<span class="skill-tag matched">${escapeHtml(s)}</span>`).join('')}
                    </div>
                  </div>
                </div>

                <div class="job-card-footer" style="padding-top:0.75rem; margin-top:0.75rem;">
                  <span style="font-size:0.85rem; font-weight:700;">${escapeHtml(job.salary || 'Not Disclosed')}</span>
                  <a href="/job-details.html?id=${job._id}" class="btn btn-primary btn-sm">
                    View & Apply &rarr;
                  </a>
                </div>
              </div>
            `;
          })
          .join('')}
      </div>
    `;
  } catch (err) {
    container.innerHTML = `
      <div style="text-align:center; padding:1.5rem; color:var(--danger);">
        Could not load recommendations: ${escapeHtml(err.message)}
      </div>
    `;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initStudentDashboard();
});

