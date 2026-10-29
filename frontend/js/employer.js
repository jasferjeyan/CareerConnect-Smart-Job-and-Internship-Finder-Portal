/**
 * CareerConnect - Employer Dashboard, Job Posting & Applicant Management
 */

// ==========================================================================
// 1. Employer Dashboard Handler
// ==========================================================================
async function initEmployerDashboard() {
  if (!requireAuth(['employer'])) return;

  const statsContainer = document.getElementById('employer-stats-container');
  if (!statsContainer) return;

  try {
    const res = await apiRequest('/employer/stats');
    const { stats } = res;

    const totalJobsEl = document.getElementById('stat-total-jobs');
    const activeJobsEl = document.getElementById('stat-active-jobs');
    const totalAppsEl = document.getElementById('stat-total-applicants');
    const companyNameEl = document.getElementById('employer-company-name');

    if (totalJobsEl) totalJobsEl.textContent = stats.totalJobs;
    if (activeJobsEl) activeJobsEl.textContent = stats.activeJobs;
    if (totalAppsEl) totalAppsEl.textContent = stats.totalApplicants;
    if (companyNameEl) companyNameEl.textContent = stats.company.companyName || 'Your Company';

    // Render Recent Postings Table
    const recentJobsTable = document.getElementById('employer-recent-jobs');
    if (recentJobsTable) {
      if (!stats.recentJobs || stats.recentJobs.length === 0) {
        recentJobsTable.innerHTML = `
          <tr><td colspan="5" style="text-align:center; padding:1.5rem; color:var(--text-muted);">
            No jobs posted yet. <a href="/post-job.html" style="font-weight:600;">Post your first opening &rarr;</a>
          </td></tr>
        `;
      } else {
        recentJobsTable.innerHTML = stats.recentJobs
          .map(
            (j) => `
          <tr>
            <td>
              <a href="/job-details.html?id=${j._id}" style="font-weight:700; color:var(--text-main);">
                ${escapeHtml(j.title)}
              </a>
              <div style="font-size:0.8rem; color:var(--text-muted);">${escapeHtml(j.location)}</div>
            </td>
            <td><span class="badge badge-primary">${escapeHtml(j.jobType)}</span></td>
            <td>${formatDate(j.createdAt)}</td>
            <td><span class="badge ${j.status === 'Active' ? 'badge-success' : 'badge-danger'}">${j.status}</span></td>
            <td>
              <a href="/applicants.html?jobId=${j._id}" class="btn btn-outline btn-sm">Applicants</a>
            </td>
          </tr>
        `
          )
          .join('');
      }
    }

    // Render Recent Applications Table
    const recentAppsTable = document.getElementById('employer-recent-applicants');
    if (recentAppsTable) {
      if (!stats.recentApplications || stats.recentApplications.length === 0) {
        recentAppsTable.innerHTML = `
          <tr><td colspan="4" style="text-align:center; padding:1.5rem; color:var(--text-muted);">
            No candidate applications received yet.
          </td></tr>
        `;
      } else {
        recentAppsTable.innerHTML = stats.recentApplications
          .map(
            (a) => `
          <tr>
            <td>
              <strong>${escapeHtml(a.studentId?.name || 'Candidate')}</strong>
              <div style="font-size:0.8rem; color:var(--text-muted);">${escapeHtml(a.studentId?.email || '')}</div>
            </td>
            <td>${escapeHtml(a.jobId?.title || 'Job Listing')}</td>
            <td>${getStatusBadge(a.status)}</td>
            <td>
              <a href="/applicants.html" class="btn btn-primary btn-sm">Review</a>
            </td>
          </tr>
        `
          )
          .join('');
      }
    }
  } catch (err) {
    showToast('Failed to load employer stats: ' + err.message, 'error');
  }
}

// ==========================================================================
// 2. Post / Edit Job Form Handler
// ==========================================================================
async function initPostJobForm() {
  if (!requireAuth(['employer'])) return;

  const form = document.getElementById('post-job-form');
  if (!form) return;

  const urlParams = new URLSearchParams(window.location.search);
  const editJobId = urlParams.get('id');

  // If in Edit Mode, fetch existing job details
  if (editJobId) {
    const pageHeading = document.getElementById('post-job-heading');
    const submitBtn = document.getElementById('submit-job-btn');

    if (pageHeading) pageHeading.textContent = 'Edit Job Listing';
    if (submitBtn) submitBtn.textContent = 'Update Job Listing';

    try {
      const res = await apiRequest(`/jobs/${editJobId}`);
      const job = res.job;

      document.getElementById('job-title').value = job.title || '';
      document.getElementById('company-name').value = job.companyName || '';
      document.getElementById('job-category').value = job.category || 'Software Engineering';
      document.getElementById('job-type').value = job.jobType || 'Full-time';
      document.getElementById('workplace-mode').value = job.workplaceMode || 'Onsite';
      document.getElementById('experience-level').value = job.experienceLevel || 'Fresher';
      document.getElementById('job-location').value = job.location || '';
      document.getElementById('job-salary').value = job.salary || '';
      if (job.deadline) {
        document.getElementById('job-deadline').value = job.deadline.split('T')[0];
      }
      document.getElementById('job-description').value = job.description || '';
      document.getElementById('job-responsibilities').value = job.responsibilities || '';
      document.getElementById('job-qualifications').value = job.qualifications || '';
      document.getElementById('job-skills').value = (job.requiredSkills || []).join(', ');
    } catch (err) {
      showToast('Failed to load job for editing: ' + err.message, 'error');
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('job-title').value.trim();
    const companyName = document.getElementById('company-name').value.trim();
    const category = document.getElementById('job-category').value;
    const jobType = document.getElementById('job-type').value;
    const workplaceMode = document.getElementById('workplace-mode').value;
    const experienceLevel = document.getElementById('experience-level').value;
    const location = document.getElementById('job-location').value.trim();
    const salary = document.getElementById('job-salary').value.trim();
    const deadline = document.getElementById('job-deadline').value;
    const description = document.getElementById('job-description').value.trim();
    const responsibilities = document.getElementById('job-responsibilities').value.trim();
    const qualifications = document.getElementById('job-qualifications').value.trim();
    const requiredSkills = document.getElementById('job-skills').value.trim();

    if (!title || !companyName || !location || !description || !requiredSkills) {
      showToast('Please fill out all required fields.', 'warning');
      return;
    }

    const payload = {
      title,
      companyName,
      category,
      jobType,
      workplaceMode,
      experienceLevel,
      location,
      salary,
      deadline: deadline || null,
      description,
      responsibilities,
      qualifications,
      requiredSkills
    };

    const submitBtn = document.getElementById('submit-job-btn');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = editJobId ? 'Updating...' : 'Publishing...';
    }

    try {
      if (editJobId) {
        await apiRequest(`/jobs/${editJobId}`, {
          method: 'PATCH',
          body: payload
        });
        showToast('Job listing updated successfully!', 'success');
      } else {
        await apiRequest('/jobs', {
          method: 'POST',
          body: payload
        });
        showToast('Opportunity posted successfully!', 'success');
      }

      setTimeout(() => {
        window.location.href = '/manage-jobs.html';
      }, 1000);
    } catch (err) {
      showToast(err.message, 'error');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = editJobId ? 'Update Job Listing' : 'Publish Opportunity';
      }
    }
  });
}

// ==========================================================================
// 3. Manage Jobs Table Handler
// ==========================================================================
async function initManageJobs() {
  if (!requireAuth(['employer'])) return;

  const container = document.getElementById('manage-jobs-table-body');
  if (!container) return;

  container.innerHTML = `
    <tr><td colspan="6" style="text-align:center; padding:2rem; color:var(--text-muted);">
      Loading your posted opportunities...
    </td></tr>
  `;

  try {
    const res = await apiRequest('/employer/jobs');
    const jobs = res.jobs || [];

    if (jobs.length === 0) {
      container.innerHTML = `
        <tr><td colspan="6" style="text-align:center; padding:2.5rem;">
          <div class="empty-icon" style="font-size:2rem;">📋</div>
          <div style="font-weight:700; margin-bottom:0.4rem;">No Jobs Posted Yet</div>
          <p style="color:var(--text-muted); font-size:0.9rem; margin-bottom:1rem;">Post your first job or internship to start receiving applicant resumes.</p>
          <a href="/post-job.html" class="btn btn-primary btn-sm">+ Post a Job</a>
        </td></tr>
      `;
      return;
    }

    container.innerHTML = jobs
      .map((job) => {
        const isClosed = job.status === 'Closed';

        return `
          <tr>
            <td>
              <a href="/job-details.html?id=${job._id}" style="font-weight:700; color:var(--text-main);">
                ${escapeHtml(job.title)}
              </a>
              <div style="font-size:0.8rem; color:var(--text-muted);">
                ${escapeHtml(job.category)} &bull; ${escapeHtml(job.location)}
              </div>
            </td>
            <td><span class="badge badge-primary">${escapeHtml(job.jobType)}</span></td>
            <td>
              <a href="/applicants.html?jobId=${job._id}" style="font-weight:700; color:var(--primary);">
                ${job.applicantCount || 0} applicant(s)
              </a>
            </td>
            <td>${formatDate(job.createdAt)}</td>
            <td>
              <span class="badge ${isClosed ? 'badge-danger' : 'badge-success'}">${job.status}</span>
            </td>
            <td>
              <div style="display:flex; gap:0.4rem; align-items:center;">
                <a href="/post-job.html?id=${job._id}" class="btn btn-outline btn-sm" style="padding:0.25rem 0.5rem;" title="Edit">
                  ✏️ Edit
                </a>
                <button class="btn btn-outline btn-sm" style="padding:0.25rem 0.5rem;" onclick="toggleJobStatus('${job._id}', '${isClosed ? 'Active' : 'Closed'}')">
                  ${isClosed ? '▶ Open' : '⏸ Close'}
                </button>
                <button class="btn btn-danger btn-sm" style="padding:0.25rem 0.5rem;" onclick="handleDeleteJob('${job._id}')" title="Delete">
                  🗑
                </button>
              </div>
            </td>
          </tr>
        `;
      })
      .join('');
  } catch (err) {
    container.innerHTML = `
      <tr><td colspan="6" style="text-align:center; padding:1.5rem; color:var(--danger);">
        Error: ${escapeHtml(err.message)}
      </td></tr>
    `;
  }
}

async function toggleJobStatus(jobId, newStatus) {
  try {
    await apiRequest(`/jobs/${jobId}`, {
      method: 'PATCH',
      body: { status: newStatus }
    });

    showToast(`Job listing status changed to ${newStatus}.`, 'success');
    initManageJobs();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function handleDeleteJob(jobId) {
  if (!confirm('Are you sure you want to permanently delete this job listing? All associated applications will also be removed.')) return;

  try {
    await apiRequest(`/jobs/${jobId}`, {
      method: 'DELETE'
    });

    showToast('Job listing removed successfully.', 'info');
    initManageJobs();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ==========================================================================
// 4. View Applicants Handler
// ==========================================================================
let allApplicants = [];

async function initViewApplicants() {
  if (!requireAuth(['employer'])) return;

  const container = document.getElementById('applicants-list-container');
  if (!container) return;

  // Check if filtered by jobId in query
  const urlParams = new URLSearchParams(window.location.search);
  const jobIdParam = urlParams.get('jobId') || '';

  // Populate jobs dropdown for filtering
  try {
    const jobsRes = await apiRequest('/employer/jobs');
    const jobs = jobsRes.jobs || [];

    const jobFilterSelect = document.getElementById('applicant-job-filter');
    if (jobFilterSelect) {
      jobFilterSelect.innerHTML = `<option value="">All Jobs (${jobs.length})</option>` +
        jobs.map((j) => `<option value="${j._id}" ${j._id === jobIdParam ? 'selected' : ''}>${escapeHtml(j.title)}</option>`).join('');

      jobFilterSelect.addEventListener('change', () => filterAndRenderApplicants());
    }

    const statusFilterSelect = document.getElementById('applicant-status-filter');
    if (statusFilterSelect) {
      statusFilterSelect.addEventListener('change', () => filterAndRenderApplicants());
    }
  } catch (err) {
    console.warn('Failed to load employer jobs for filter:', err);
  }

  fetchApplicantsData();
}

async function fetchApplicantsData() {
  const container = document.getElementById('applicants-list-container');
  if (!container) return;

  container.innerHTML = `
    <div style="text-align:center; padding:3rem; color:var(--text-muted);">
      Loading applicant profiles and resumes...
    </div>
  `;

  try {
    const res = await apiRequest('/employer/applications');
    allApplicants = res.applications || [];
    filterAndRenderApplicants();
  } catch (err) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">⚠️</div>
        <h3 class="empty-title">Error Loading Applicants</h3>
        <p class="empty-text">${escapeHtml(err.message)}</p>
      </div>
    `;
  }
}

function filterAndRenderApplicants() {
  const container = document.getElementById('applicants-list-container');
  const countEl = document.getElementById('applicants-total-count');
  if (!container) return;

  const jobFilter = document.getElementById('applicant-job-filter')?.value || '';
  const statusFilter = document.getElementById('applicant-status-filter')?.value || '';

  let filtered = allApplicants;

  if (jobFilter) {
    filtered = filtered.filter((a) => a.jobId?._id === jobFilter);
  }

  if (statusFilter && statusFilter !== 'All') {
    filtered = filtered.filter((a) => a.status === statusFilter);
  }

  if (countEl) {
    countEl.textContent = `Showing ${filtered.length} candidate(s)`;
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">👥</div>
        <h4 class="empty-title">No Applicants Found</h4>
        <p class="empty-text">No applicants match your current filter selections.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:1.25rem;">
      ${filtered
        .map((app) => {
          const student = app.studentId || {};
          const profile = app.studentProfile || {};
          const job = app.jobId || {};
          const resume = app.resumeId;

          const skillsList = (profile.skills || []).map((s) => `<span class="skill-tag">${escapeHtml(s)}</span>`).join('');

          return `
            <div class="card" style="border-left: 4px solid var(--primary);">
              <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:1rem; margin-bottom:1rem;">
                <div>
                  <h3 style="font-size:1.2rem; font-weight:700; color:var(--text-main); margin-bottom:0.2rem;">
                    ${escapeHtml(student.name || 'Candidate')}
                  </h3>
                  <div style="font-size:0.9rem; color:var(--primary); font-weight:600;">
                    Applied for: ${escapeHtml(job.title || 'Job')}
                  </div>
                  <div style="font-size:0.85rem; color:var(--text-muted); margin-top:0.25rem;">
                    📧 ${escapeHtml(student.email || '')} ${profile.phone ? `&bull; 📞 ${escapeHtml(profile.phone)}` : ''}
                  </div>
                </div>

                <div style="display:flex; align-items:center; gap:0.75rem;">
                  <span style="font-size:0.85rem; font-weight:600; color:var(--text-muted);">Status:</span>
                  <select class="form-control" style="width:auto; padding:0.4rem 0.75rem; font-size:0.85rem; font-weight:600;" onchange="updateApplicantStatus('${app._id}', this.value)">
                    <option value="Applied" ${app.status === 'Applied' ? 'selected' : ''}>Applied</option>
                    <option value="Under Review" ${app.status === 'Under Review' ? 'selected' : ''}>Under Review</option>
                    <option value="Shortlisted" ${app.status === 'Shortlisted' ? 'selected' : ''}>Shortlisted</option>
                    <option value="Selected" ${app.status === 'Selected' ? 'selected' : ''}>Selected</option>
                    <option value="Rejected" ${app.status === 'Rejected' ? 'selected' : ''}>Rejected</option>
                    <option value="Withdrawn" ${app.status === 'Withdrawn' ? 'selected' : ''}>Withdrawn</option>
                  </select>
                </div>
              </div>

              <!-- Education & Skills Summary -->
              <div style="background:var(--bg-subtle); padding:0.85rem 1rem; border-radius:var(--radius-md); margin-bottom:1rem; font-size:0.85rem;">
                <div><strong>Education:</strong> ${escapeHtml(profile.degree || 'Degree')} at ${escapeHtml(profile.college || 'University')} (Grad: ${profile.graduationYear || 'N/A'})</div>
                <div style="margin-top:0.4rem; display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap;">
                  <strong>Skills:</strong>
                  <div class="skills-wrap" style="margin:0;">
                    ${skillsList || '<span style="color:var(--text-muted);">No skills listed</span>'}
                  </div>
                </div>
              </div>

              <!-- Cover Letter -->
              ${
                app.coverLetter
                  ? `
                <div style="margin-bottom:1rem; font-size:0.9rem;">
                  <strong>Cover Letter Note:</strong>
                  <div style="background:#ffffff; border:1px solid var(--border-subtle); padding:0.75rem; border-radius:var(--radius-sm); margin-top:0.3rem; font-style:italic; color:var(--text-muted);">
                    "${escapeHtml(app.coverLetter)}"
                  </div>
                </div>
              `
                  : ''
              }

              <!-- Resume Link & Meta -->
              <div style="display:flex; justify-content:space-between; align-items:center; padding-top:0.75rem; border-top:1px solid var(--border-subtle); font-size:0.85rem;">
                <span style="color:var(--text-muted);">Applied on ${formatDate(app.appliedAt)}</span>
                <div>
                  ${
                    resume
                      ? `
                    <a href="/api/resumes/${resume._id}/view" target="_blank" class="btn btn-outline btn-sm">
                      👁 View Resume PDF
                    </a>
                    <a href="/api/resumes/${resume._id}/download?download=true" class="btn btn-primary btn-sm">
                      ⬇ Download PDF
                    </a>
                  `
                      : '<span style="color:var(--text-muted);">No resume attached</span>'
                  }
                </div>
              </div>
            </div>
          `;
        })
        .join('')}
    </div>
  `;
}

async function updateApplicantStatus(applicationId, newStatus) {
  try {
    await apiRequest(`/applications/${applicationId}/status`, {
      method: 'PATCH',
      body: { status: newStatus }
    });

    showToast(`Status updated to "${newStatus}"!`, 'success');

    // Update in local array
    const target = allApplicants.find((a) => a._id === applicationId);
    if (target) target.status = newStatus;
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// Router for employer pages
document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;

  if (path.includes('employer-dashboard')) {
    initEmployerDashboard();
  } else if (path.includes('post-job')) {
    initPostJobForm();
  } else if (path.includes('manage-jobs')) {
    initManageJobs();
  } else if (path.includes('applicants')) {
    initViewApplicants();
  }
});

