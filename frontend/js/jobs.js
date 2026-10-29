/**
 * CareerConnect - Jobs & Internships Search, Filter & Browsing Handler
 */

let currentJobs = [];
let currentPage = 1;
let totalPages = 1;
let currentLimit = 12; // 12 jobs per page default, or 'all'

async function fetchAndRenderJobs(page = 1, appendMode = false) {
  currentPage = page;
  const container = document.getElementById('jobs-container');
  const countEl = document.getElementById('jobs-count');
  const paginationEl = document.getElementById('pagination-container');

  if (!container) return;

  if (!appendMode) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
        <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">⏳</div>
        <p style="color: var(--text-muted);">Fetching matching opportunities...</p>
      </div>
    `;
  }

  // Collect filter values
  const search = document.getElementById('search-input')?.value.trim() || '';
  const location = document.getElementById('location-input')?.value.trim() || '';
  const category = document.getElementById('category-filter')?.value || 'All';
  const workplaceMode = document.getElementById('mode-filter')?.value || 'All';
  const sort = document.getElementById('sort-filter')?.value || 'newest';

  // Determine jobType filter (handle page context: internships.html forces or filters to Internship)
  let jobType = document.getElementById('type-filter')?.value || 'All';
  const isInternshipPage = window.location.pathname.includes('internships.html');
  if (isInternshipPage && jobType === 'All') {
    jobType = 'Internship';
  }

  const queryParams = new URLSearchParams({
    page: currentPage,
    limit: currentLimit === 'all' ? 100 : currentLimit,
    search,
    location,
    category,
    jobType,
    workplaceMode,
    sort
  });

  try {
    const res = await apiRequest(`/jobs?${queryParams.toString()}`);
    const newJobs = res.jobs || [];
    totalPages = res.totalPages || 1;

    if (appendMode) {
      currentJobs = [...currentJobs, ...newJobs];
    } else {
      currentJobs = newJobs;
    }

    if (countEl) {
      if (res.total === 0) {
        countEl.textContent = 'No matching opportunities found';
      } else if (currentLimit === 'all' || totalPages <= 1) {
        countEl.textContent = `Showing all ${res.total} verified opportunities`;
      } else {
        const startNum = (currentPage - 1) * (currentLimit === 'all' ? 100 : currentLimit) + 1;
        const endNum = Math.min(startNum + res.count - 1, res.total);
        countEl.textContent = `Showing ${startNum}–${endNum} of ${res.total} opportunities (Page ${currentPage} of ${totalPages})`;
      }
    }

    if (currentJobs.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1/-1;" class="empty-state">
          <div class="empty-icon">🔍</div>
          <h3 class="empty-title">No opportunities found</h3>
          <p class="empty-text">Try loosening your search keywords or clearing location/category filters to explore more listings.</p>
          <button class="btn btn-outline btn-sm" onclick="clearFilters()">Reset All Filters</button>
        </div>
      `;
      if (paginationEl) paginationEl.innerHTML = '';
      return;
    }

    const cardsHtml = currentJobs
      .map((job) => {
        const isSaved = !!job.isSaved;
        const hasApplied = !!job.hasApplied;

        let matchBadge = '';
        if (job.matchPercentage !== undefined && job.matchPercentage > 0) {
          matchBadge = `
            <span class="badge badge-success" title="Calculated from your profile skills">
              🎯 ${job.matchPercentage}% Skill Match
            </span>
          `;
        }

        const skillsHtml = (job.requiredSkills || [])
          .slice(0, 4)
          .map((s) => {
            const isMatch = (job.matchingSkills || []).some(
              (m) => m.toLowerCase() === s.toLowerCase()
            );
            return `<span class="skill-tag ${isMatch ? 'matched' : ''}">${escapeHtml(s)}</span>`;
          })
          .join('');

        return `
          <div class="job-card">
            <div>
              <div class="job-card-header">
                <div style="flex: 1; padding-right: 0.5rem;">
                  <h3 class="job-title" title="${escapeHtml(job.title)}">${escapeHtml(job.title)}</h3>
                  <div class="company-name">${escapeHtml(job.companyName)}</div>
                </div>
                <button
                  type="button"
                  class="btn ${isSaved ? 'btn-primary' : 'btn-outline'} btn-sm save-job-btn"
                  style="padding: 0.3rem 0.65rem; font-size: 0.8rem; flex-shrink: 0;"
                  onclick="toggleSaveJob('${job._id}', this)"
                  title="${isSaved ? 'Remove from Saved Jobs' : 'Save Job'}"
                >
                  ${isSaved ? '★ Saved' : '☆ Save Job'}
                </button>
              </div>

              <div class="job-meta-list">
                <span class="job-meta-item">📍 ${escapeHtml(job.location)}</span>
                <span class="job-meta-item">💼 ${escapeHtml(job.jobType)}</span>
                <span class="job-meta-item">🏢 ${escapeHtml(job.workplaceMode)}</span>
              </div>

              ${matchBadge ? `<div style="margin: 0.5rem 0;">${matchBadge}</div>` : ''}

              <div class="skills-wrap">
                ${skillsHtml}
                ${job.requiredSkills?.length > 4 ? `<span class="skill-tag">+${job.requiredSkills.length - 4} more</span>` : ''}
              </div>
            </div>

            <div class="job-card-footer" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
              <div>
                <span class="job-salary">${escapeHtml(job.salary || 'Not Disclosed')}</span>
                ${hasApplied ? `<div style="margin-top: 0.25rem;">${getStatusBadge(job.applicationStatus || 'Applied')}</div>` : ''}
              </div>
              <div style="display: flex; gap: 0.5rem; align-items: center;">
                <a href="/job-details.html?id=${job._id}" class="btn btn-outline btn-sm" title="View details and skill fit">
                  View Details
                </a>
                ${
                  hasApplied
                    ? `<span class="badge badge-success" style="padding: 0.4rem 0.65rem; font-size: 0.8rem;">✓ Applied</span>`
                    : `<a href="/job-details.html?id=${job._id}#apply" class="btn btn-primary btn-sm" title="Apply for this position">
                        Apply Now &rarr;
                      </a>`
                }
              </div>
            </div>
          </div>
        `;
      })
      .join('');

    container.innerHTML = cardsHtml;
    renderPagination(paginationEl, res.total);
  } catch (err) {
    container.innerHTML = `
      <div style="grid-column: 1/-1;" class="empty-state">
        <div class="empty-icon">⚠️</div>
        <h3 class="empty-title">Failed to load listings</h3>
        <p class="empty-text">${escapeHtml(err.message)}</p>
        <button class="btn btn-primary btn-sm" onclick="fetchAndRenderJobs(${currentPage})">Retry</button>
      </div>
    `;
  }
}

function renderPagination(el, totalResults = 0) {
  if (!el) return;

  if (totalResults <= 12 && currentLimit !== 'all') {
    el.innerHTML = '';
    return;
  }

  let html = `
    <div style="display:flex; flex-direction:column; align-items:center; gap:1rem; margin-top:2.5rem;">
      <!-- Page Navigation Controls -->
      <div style="display:flex; justify-content:center; align-items:center; flex-wrap:wrap; gap:0.4rem;">
  `;

  if (currentLimit !== 'all' && totalPages > 1) {
    // Previous button
    html += `
      <button
        class="btn btn-outline btn-sm"
        ${currentPage <= 1 ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : ''}
        onclick="goToPage(${currentPage - 1})"
      >
        &larr; Previous
      </button>
    `;

    // Page number buttons
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - 2 && i <= currentPage + 2)
      ) {
        html += `
          <button
            class="btn ${i === currentPage ? 'btn-primary' : 'btn-outline'} btn-sm"
            style="min-width:38px; font-weight:700;"
            onclick="goToPage(${i})"
          >
            ${i}
          </button>
        `;
      } else if (
        (i === currentPage - 3 && i > 1) ||
        (i === currentPage + 3 && i < totalPages)
      ) {
        html += `<span style="padding:0 0.3rem; color:var(--text-muted);">…</span>`;
      }
    }

    // Next button
    html += `
      <button
        class="btn btn-outline btn-sm"
        ${currentPage >= totalPages ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : ''}
        onclick="goToPage(${currentPage + 1})"
      >
        Next &rarr;
      </button>
    `;
  }

  html += `
      </div>

      <!-- Quick Page Size & Load All Controls -->
      <div style="display:flex; align-items:center; gap:0.75rem; font-size:0.875rem; color:var(--text-muted);">
        <span>Show per page:</span>
        <button
          class="btn ${currentLimit === 12 ? 'btn-primary' : 'btn-outline'} btn-sm"
          style="padding:0.25rem 0.65rem;"
          onclick="setLimit(12)"
        >
          12
        </button>
        <button
          class="btn ${currentLimit === 24 ? 'btn-primary' : 'btn-outline'} btn-sm"
          style="padding:0.25rem 0.65rem;"
          onclick="setLimit(24)"
        >
          24
        </button>
        <button
          class="btn ${currentLimit === 'all' ? 'btn-primary' : 'btn-outline'} btn-sm"
          style="padding:0.25rem 0.65rem;"
          onclick="setLimit('all')"
          title="Display all opportunities on a single page"
        >
          View All (${totalResults})
        </button>
      </div>
    </div>
  `;

  el.innerHTML = html;
}

function goToPage(page) {
  if (page < 1 || page > totalPages) return;
  fetchAndRenderJobs(page);
  const container = document.getElementById('jobs-container');
  if (container) {
    container.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function setLimit(limit) {
  currentLimit = limit;
  fetchAndRenderJobs(1);
  const container = document.getElementById('jobs-container');
  if (container) {
    container.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

async function toggleSaveJob(jobId, btn) {
  if (!isLoggedIn()) {
    showToast('Please sign in as a student to save jobs to your bookmarks', 'warning');
    setTimeout(() => {
      window.location.href = `/login.html?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
    }, 1200);
    return;
  }

  if (getUserRole() !== 'student') {
    showToast('Saved bookmarks are available for student job seekers', 'info');
    return;
  }

  try {
    const isCurrentlySaved = btn.textContent.includes('Saved');
    if (isCurrentlySaved) {
      await apiRequest(`/saved-jobs/${jobId}`, { method: 'DELETE' });
      btn.className = 'btn btn-outline btn-sm save-job-btn';
      btn.textContent = '☆ Save Job';
      showToast('Removed from saved jobs', 'info');
    } else {
      await apiRequest(`/saved-jobs/${jobId}`, { method: 'POST' });
      btn.className = 'btn btn-primary btn-sm save-job-btn';
      btn.textContent = '★ Saved';
      showToast('Saved to your bookmarks!', 'success');
    }
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function clearFilters() {
  const search = document.getElementById('search-input');
  const location = document.getElementById('location-input');
  const category = document.getElementById('category-filter');
  const type = document.getElementById('type-filter');
  const mode = document.getElementById('mode-filter');
  const sort = document.getElementById('sort-filter');

  if (search) search.value = '';
  if (location) location.value = '';
  if (category) category.value = 'All';
  if (type) type.value = 'All';
  if (mode) mode.value = 'All';
  if (sort) sort.value = 'newest';

  currentLimit = 12;
  fetchAndRenderJobs(1);
}

document.addEventListener('DOMContentLoaded', () => {
  // Read any query params from URL (e.g. from hero search bar: ?search=...&location=...)
  const params = new URLSearchParams(window.location.search);
  const searchInput = document.getElementById('search-input');
  const locationInput = document.getElementById('location-input');
  const categoryFilter = document.getElementById('category-filter');
  const typeFilter = document.getElementById('type-filter');
  const modeFilter = document.getElementById('mode-filter');
  const sortFilter = document.getElementById('sort-filter');

  if (params.get('search') && searchInput) searchInput.value = params.get('search');
  if (params.get('location') && locationInput) locationInput.value = params.get('location');
  if (params.get('category') && categoryFilter) categoryFilter.value = params.get('category');
  if (params.get('jobType') && typeFilter) typeFilter.value = params.get('jobType');
  if (params.get('mode') && modeFilter) modeFilter.value = params.get('mode');

  // Attach search button and filter form submit listeners
  const filterForm = document.getElementById('filter-form');
  if (filterForm) {
    filterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      fetchAndRenderJobs(1);
    });
  }

  const searchBtn = document.getElementById('apply-filters-btn');
  if (searchBtn) {
    searchBtn.addEventListener('click', (e) => {
      e.preventDefault();
      fetchAndRenderJobs(1);
    });
  }

  // Auto filter on select change for immediate responsiveness
  [categoryFilter, typeFilter, modeFilter, sortFilter].forEach((dropdown) => {
    if (dropdown) {
      dropdown.addEventListener('change', () => fetchAndRenderJobs(1));
    }
  });

  fetchAndRenderJobs(1);
});
