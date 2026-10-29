/**
 * CareerConnect - Job Details & Application Handler
 */

let currentJob = null;
let userResumes = [];

async function loadJobDetails() {
  const container = document.getElementById('job-details-content');
  if (!container) return;

  const urlParams = new URLSearchParams(window.location.search);
  const jobId = urlParams.get('id');

  if (!jobId) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">⚠️</div>
        <h3 class="empty-title">Job Not Specified</h3>
        <p class="empty-text">No job ID was provided in the URL.</p>
        <a href="/jobs.html" class="btn btn-primary">Browse All Jobs</a>
      </div>
    `;
    return;
  }

  try {
    const res = await apiRequest(`/jobs/${jobId}`);
    currentJob = res.job;
    renderJobDetails(currentJob);
  } catch (err) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">❌</div>
        <h3 class="empty-title">Job Not Found</h3>
        <p class="empty-text">${escapeHtml(err.message)}</p>
        <a href="/jobs.html" class="btn btn-outline">Back to Jobs</a>
      </div>
    `;
  }
}

function renderJobDetails(job) {
  const container = document.getElementById('job-details-content');
  const user = getCurrentUser();

  const isOwner = user && (user.id === job.employerId || user.role === 'admin');
  const isStudent = user && user.role === 'student';
  const hasApplied = !!job.hasApplied;
  const isSaved = !!job.isSaved;

  // Skill analysis card (Section 12 - Skill-based Recommendation Engine)
  let skillAnalysisHtml = '';
  if (isStudent && job.skillAnalysis) {
    const { matchPercentage, matchingSkills, missingSkills } = job.skillAnalysis;

    let matchColor = '#10b981'; // green
    if (matchPercentage < 40) matchColor = '#ef4444'; // red
    else if (matchPercentage < 75) matchColor = '#f59e0b'; // amber

    skillAnalysisHtml = `
      <div class="card" style="margin-bottom: 2rem; border-left: 5px solid ${matchColor};">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 1rem;">
          <div>
            <h4 style="font-size:1.15rem; font-weight:700;">🎯 Skill Fit Analysis</h4>
            <p style="font-size:0.85rem; color:var(--text-muted);">
              Compared against your profile's listed technical skills
            </p>
          </div>
          <div style="text-align:right;">
            <div style="font-size:1.8rem; font-weight:800; color:${matchColor}; line-height:1;">
              ${matchPercentage}%
            </div>
            <span style="font-size:0.75rem; color:var(--text-muted); font-weight:600;">Match Score</span>
          </div>
        </div>

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1.5rem;">
          <div>
            <span style="font-size:0.85rem; font-weight:700; color:var(--success); display:block; margin-bottom:0.4rem;">
              ✓ Matching Skills (${matchingSkills.length})
            </span>
            <div class="skills-wrap" style="margin:0;">
              ${
                matchingSkills.length > 0
                  ? matchingSkills.map((s) => `<span class="skill-tag matched">${escapeHtml(s)}</span>`).join('')
                  : '<span style="font-size:0.85rem; color:var(--text-muted);">No matching skills detected.</span>'
              }
            </div>
          </div>

          <div>
            <span style="font-size:0.85rem; font-weight:700; color:var(--warning); display:block; margin-bottom:0.4rem;">
              ! Skills You May Need to Learn (${missingSkills.length})
            </span>
            <div class="skills-wrap" style="margin:0;">
              ${
                missingSkills.length > 0
                  ? missingSkills.map((s) => `<span class="skill-tag">${escapeHtml(s)}</span>`).join('')
                  : '<span style="font-size:0.85rem; color:var(--success); font-weight:600;">You possess all required skills!</span>'
              }
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Action buttons
  let actionButtonsHtml = '';
  if (isOwner) {
    actionButtonsHtml = `
      <div style="display:flex; gap:0.75rem; align-items:center;">
        <a href="/post-job.html?id=${job._id}" class="btn btn-secondary btn-sm">Edit Listing</a>
        <a href="/applicants.html?jobId=${job._id}" class="btn btn-primary btn-sm">View Applicants</a>
      </div>
    `;
  } else if (isStudent) {
    if (hasApplied) {
      actionButtonsHtml = `
        <div style="display:flex; gap:0.75rem; align-items:center;">
          <span style="font-size:0.9rem; font-weight:600; color:var(--text-muted);">Application Status:</span>
          ${getStatusBadge(job.application?.status || 'Applied')}
          <a href="/applications.html" class="btn btn-outline btn-sm">Track in Applications</a>
        </div>
      `;
    } else {
      actionButtonsHtml = `
        <div style="display:flex; gap:0.75rem; align-items:center;">
          <button class="btn btn-outline btn-sm" id="save-job-detail-btn" onclick="toggleDetailSave('${job._id}')">
            ${isSaved ? '★ Saved' : '☆ Save Job'}
          </button>
          <button class="btn btn-primary" onclick="openApplyModal()">
            Apply for this Role &rarr;
          </button>
        </div>
      `;
    }
  } else if (!user) {
    actionButtonsHtml = `
      <div style="display:flex; gap:0.75rem; align-items:center;">
        <a href="/login.html?redirect=/job-details.html?id=${job._id}" class="btn btn-primary">
          Log In to Apply
        </a>
      </div>
    `;
  }

  const deadlineFormatted = job.deadline ? formatDate(job.deadline) : 'Rolling Admissions / Open';
  const postedDate = formatDate(job.createdAt);

  container.innerHTML = `
    <!-- Top Header Banner -->
    <div class="card" style="margin-bottom: 2rem;">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:1.5rem;">
        <div>
          <div style="display:flex; align-items:center; gap:0.6rem; margin-bottom:0.5rem;">
            <span class="badge badge-primary">${escapeHtml(job.jobType)}</span>
            <span class="badge badge-secondary">${escapeHtml(job.category)}</span>
            <span class="badge ${job.status === 'Active' ? 'badge-success' : 'badge-danger'}">${job.status}</span>
          </div>
          <h1 style="font-size: 2rem; font-weight: 800; color:var(--text-main); margin-bottom:0.4rem;">
            ${escapeHtml(job.title)}
          </h1>
          <div style="font-size:1.15rem; color:var(--primary); font-weight:600; margin-bottom:0.75rem;">
            ${escapeHtml(job.companyName)}
          </div>
          <div class="job-meta-list" style="margin:0;">
            <span class="job-meta-item">📍 ${escapeHtml(job.location)}</span>
            <span class="job-meta-item">🏢 ${escapeHtml(job.workplaceMode)}</span>
            <span class="job-meta-item">🎓 ${escapeHtml(job.experienceLevel)}</span>
            <span class="job-meta-item">📅 Posted: ${postedDate}</span>
          </div>
        </div>

        <div style="text-align:right;">
          <div style="font-size:1.4rem; font-weight:800; color:var(--text-main); margin-bottom:0.25rem;">
            ${escapeHtml(job.salary || 'Not Disclosed')}
          </div>
          <div style="font-size:0.85rem; color:var(--text-muted); margin-bottom:1rem;">
            Deadline: <strong style="color:var(--text-main);">${deadlineFormatted}</strong>
          </div>
          ${actionButtonsHtml}
        </div>
      </div>
    </div>

    ${skillAnalysisHtml}

    <!-- Two Column Layout: Main Details and Company Card -->
    <div style="display:grid; grid-template-columns: 2fr 1fr; gap:2rem;">
      <div>
        <div class="card" style="margin-bottom: 2rem;">
          <h3 style="font-size:1.25rem; font-weight:700; margin-bottom:1rem; padding-bottom:0.5rem; border-bottom:1px solid var(--border-subtle);">
            Role Overview
          </h3>
          <div style="white-space: pre-line; color:var(--text-main); line-height:1.7;">
            ${escapeHtml(job.description)}
          </div>

          ${
            job.responsibilities
              ? `
              <h3 style="font-size:1.25rem; font-weight:700; margin:1.75rem 0 0.75rem; padding-bottom:0.5rem; border-bottom:1px solid var(--border-subtle);">
                Key Responsibilities
              </h3>
              <div style="white-space: pre-line; color:var(--text-main); line-height:1.7;">
                ${escapeHtml(job.responsibilities)}
              </div>
            `
              : ''
          }

          ${
            job.qualifications
              ? `
              <h3 style="font-size:1.25rem; font-weight:700; margin:1.75rem 0 0.75rem; padding-bottom:0.5rem; border-bottom:1px solid var(--border-subtle);">
                Required Qualifications & Eligibility
              </h3>
              <div style="white-space: pre-line; color:var(--text-main); line-height:1.7;">
                ${escapeHtml(job.qualifications)}
              </div>
            `
              : ''
          }

          <h3 style="font-size:1.25rem; font-weight:700; margin:1.75rem 0 0.75rem; padding-bottom:0.5rem; border-bottom:1px solid var(--border-subtle);">
            Required Tech Stack & Skills
          </h3>
          <div class="skills-wrap">
            ${(job.requiredSkills || []).map((s) => `<span class="skill-tag" style="font-size:0.85rem; padding:0.3rem 0.75rem;">${escapeHtml(s)}</span>`).join('')}
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div>
        <div class="card" style="margin-bottom: 1.5rem;">
          <h4 style="font-size:1.1rem; font-weight:700; margin-bottom:1rem;">About the Company</h4>
          <div style="font-size:1.1rem; font-weight:700; color:var(--primary); margin-bottom:0.5rem;">
            ${escapeHtml(job.companyName)}
          </div>
          <p style="font-size:0.9rem; color:var(--text-muted); margin-bottom:1rem; line-height:1.5;">
            ${escapeHtml(job.company?.description || 'Reputed hiring partner committed to fostering student careers and technical talent.')}
          </p>
          ${
            job.company?.website
              ? `
            <a href="${escapeHtml(job.company.website)}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm btn-block">
              Visit Website ↗
            </a>
          `
              : ''
          }
        </div>

        <div class="card" style="background:var(--bg-subtle);">
          <h4 style="font-size:1rem; font-weight:700; margin-bottom:0.75rem;">Summary Checklist</h4>
          <ul style="list-style:none; font-size:0.85rem; display:flex; flex-direction:column; gap:0.6rem; color:var(--text-muted);">
            <li><strong>Employment:</strong> ${escapeHtml(job.jobType)}</li>
            <li><strong>Workplace:</strong> ${escapeHtml(job.workplaceMode)}</li>
            <li><strong>Location:</strong> ${escapeHtml(job.location)}</li>
            <li><strong>Experience:</strong> ${escapeHtml(job.experienceLevel)}</li>
            <li><strong>Category:</strong> ${escapeHtml(job.category)}</li>
            <li><strong>Salary / Stipend:</strong> ${escapeHtml(job.salary || 'Not Disclosed')}</li>
          </ul>
        </div>
      </div>
    </div>
  `;
}

async function toggleDetailSave(jobId) {
  const btn = document.getElementById('save-job-detail-btn');
  if (!isLoggedIn()) {
    showToast('Please log in as a student to save jobs', 'warning');
    return;
  }

  try {
    const isSaved = btn.textContent.includes('Saved');
    if (isSaved) {
      await apiRequest(`/saved-jobs/${jobId}`, { method: 'DELETE' });
      btn.textContent = '☆ Save Job';
      showToast('Removed from saved bookmarks', 'info');
    } else {
      await apiRequest(`/saved-jobs/${jobId}`, { method: 'POST' });
      btn.textContent = '★ Saved';
      showToast('Saved to your bookmarks!', 'success');
    }
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// Modal handling
async function openApplyModal() {
  if (!isLoggedIn()) {
    window.location.href = `/login.html?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
    return;
  }

  if (getUserRole() !== 'student') {
    showToast('Only students and job seekers can submit applications.', 'warning');
    return;
  }

  const modal = document.getElementById('apply-modal');
  const resumeSelect = document.getElementById('apply-resume-select');
  const noResumeNotice = document.getElementById('no-resume-notice');

  if (!modal) return;

  // Load student's resumes
  try {
    const res = await apiRequest('/resumes');
    userResumes = res.resumes || [];

    if (userResumes.length === 0) {
      resumeSelect.style.display = 'none';
      noResumeNotice.style.display = 'block';
    } else {
      resumeSelect.style.display = 'block';
      noResumeNotice.style.display = 'none';
      resumeSelect.innerHTML = userResumes
        .map(
          (r, idx) =>
            `<option value="${r._id}" ${idx === 0 ? 'selected' : ''}>${escapeHtml(r.originalName)} (${Math.round(r.fileSize / 1024)} KB)</option>`
        )
        .join('');
    }

    modal.classList.add('active');
  } catch (err) {
    showToast('Failed to load resumes: ' + err.message, 'error');
  }
}

function closeApplyModal() {
  const modal = document.getElementById('apply-modal');
  if (modal) modal.classList.remove('active');
}

async function handleApplicationSubmit(e) {
  e.preventDefault();
  if (!currentJob) return;

  const resumeId = document.getElementById('apply-resume-select')?.value;
  const coverLetter = document.getElementById('apply-cover-letter')?.value.trim() || '';

  if (!resumeId) {
    showToast('Please select or upload a resume first.', 'warning');
    return;
  }

  const submitBtn = document.getElementById('submit-app-btn');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
  }

  try {
    await apiRequest(`/jobs/${currentJob._id}/apply`, {
      method: 'POST',
      body: {
        resumeId,
        coverLetter
      }
    });

    closeApplyModal();
    showToast('Application submitted successfully! Good luck!', 'success');

    // Reload job details to show application status
    setTimeout(() => {
      loadJobDetails();
    }, 800);
  } catch (err) {
    showToast(err.message, 'error');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Application';
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadJobDetails().then(() => {
    // Automatically trigger Apply Now modal if navigated with #apply anchor
    if (window.location.hash === '#apply') {
      const user = getCurrentUser();
      if (!user) {
        showToast('Please sign in as a student to submit your application', 'info');
      } else if (user.role === 'student' && !currentJob?.hasApplied) {
        setTimeout(() => {
          if (typeof openApplyModal === 'function') {
            openApplyModal();
          }
        }, 400);
      }
    }
  });

  const applyForm = document.getElementById('apply-job-form');
  if (applyForm) {
    applyForm.addEventListener('submit', handleApplicationSubmit);
  }
});

