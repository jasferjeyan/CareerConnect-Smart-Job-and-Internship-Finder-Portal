/**
 * CareerConnect - Saved Jobs & Bookmarks
 */

async function loadSavedJobs() {
  if (!requireAuth(['student'])) return;

  const container = document.getElementById('saved-jobs-container');
  const countEl = document.getElementById('saved-count');
  if (!container) return;

  container.innerHTML = `
    <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-muted);">
      Loading your bookmarked opportunities...
    </div>
  `;

  try {
    const res = await apiRequest('/saved-jobs');
    const savedJobs = res.savedJobs || [];

    if (countEl) {
      countEl.textContent = `${savedJobs.length} bookmarked position(s)`;
    }

    if (savedJobs.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1/-1;" class="empty-state">
          <div class="empty-icon">⭐</div>
          <h3 class="empty-title">No Saved Jobs Yet</h3>
          <p class="empty-text">Whenever you see an interesting role, click "Save" to keep track of it here.</p>
          <a href="/jobs.html" class="btn btn-primary">Browse Jobs Now</a>
        </div>
      `;
      return;
    }

    container.innerHTML = savedJobs
      .map((item) => {
        const job = item.jobId;
        if (!job) return '';

        const savedDate = formatDate(item.savedAt);

        return `
          <div class="job-card">
            <div>
              <div class="job-card-header">
                <div>
                  <h3 class="job-title">${escapeHtml(job.title)}</h3>
                  <div class="company-name">${escapeHtml(job.companyName)}</div>
                </div>
                <button class="btn btn-outline btn-sm" style="color:var(--danger); border-color:#fecaca;" onclick="handleUnsaveJob('${job._id}')" title="Remove from bookmarks">
                  ✕ Unsave
                </button>
              </div>

              <div class="job-meta-list">
                <span class="job-meta-item">📍 ${escapeHtml(job.location)}</span>
                <span class="job-meta-item">💼 ${escapeHtml(job.jobType)}</span>
                <span class="job-meta-item">🏢 ${escapeHtml(job.workplaceMode)}</span>
              </div>

              <div class="skills-wrap">
                ${(job.requiredSkills || []).slice(0, 4).map((s) => `<span class="skill-tag">${escapeHtml(s)}</span>`).join('')}
              </div>

              <div style="font-size:0.75rem; color:var(--text-muted); margin-top:0.4rem;">
                Saved on: ${savedDate}
              </div>
            </div>

            <div class="job-card-footer">
              <span class="job-salary">${escapeHtml(job.salary || 'Not Disclosed')}</span>
              <a href="/job-details.html?id=${job._id}" class="btn btn-primary btn-sm">
                Apply / View &rarr;
              </a>
            </div>
          </div>
        `;
      })
      .join('');
  } catch (err) {
    container.innerHTML = `
      <div style="grid-column: 1/-1;" class="empty-state">
        <div class="empty-icon">⚠️</div>
        <h3 class="empty-title">Error Loading Saved Jobs</h3>
        <p class="empty-text">${escapeHtml(err.message)}</p>
      </div>
    `;
  }
}

async function handleUnsaveJob(jobId) {
  try {
    await apiRequest(`/saved-jobs/${jobId}`, {
      method: 'DELETE'
    });

    showToast('Removed from saved jobs', 'info');
    loadSavedJobs();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadSavedJobs();
});

