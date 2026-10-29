/**
 * CareerConnect - Student Applications Tracking
 */

async function loadMyApplications() {
  if (!requireAuth(['student'])) return;

  const container = document.getElementById('applications-container');
  const countEl = document.getElementById('applications-count');
  if (!container) return;

  container.innerHTML = `
    <div style="text-align:center; padding:3rem; color:var(--text-muted);">
      Loading your submitted applications...
    </div>
  `;

  try {
    const res = await apiRequest('/applications/me');
    const applications = res.applications || [];

    if (countEl) {
      countEl.textContent = `${applications.length} submitted application(s)`;
    }

    if (applications.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📨</div>
          <h3 class="empty-title">No Applications Submitted Yet</h3>
          <p class="empty-text">You haven't applied for any jobs or internships yet. Browse openings and take your first step!</p>
          <a href="/jobs.html" class="btn btn-primary">Browse Available Jobs</a>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th>Role & Company</th>
              <th>Type</th>
              <th>Applied Date</th>
              <th>Resume</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${applications
              .map((app) => {
                const job = app.jobId;
                if (!job) {
                  return `
                    <tr>
                      <td colspan="6" style="color:var(--text-muted); font-style:italic;">
                        Job posting has been removed by employer.
                      </td>
                    </tr>
                  `;
                }

                const canWithdraw = !['Withdrawn', 'Selected', 'Rejected'].includes(app.status);
                const appliedDate = formatDate(app.appliedAt);

                return `
                  <tr>
                    <td>
                      <a href="/job-details.html?id=${job._id}" style="font-weight:700; color:var(--text-main);">
                        ${escapeHtml(job.title)}
                      </a>
                      <div style="font-size:0.85rem; color:var(--primary); font-weight:600;">
                        ${escapeHtml(job.companyName)} &bull; ${escapeHtml(job.location)}
                      </div>
                    </td>
                    <td>
                      <span class="badge badge-primary">${escapeHtml(job.jobType)}</span>
                    </td>
                    <td>${appliedDate}</td>
                    <td>
                      ${
                        app.resumeId
                          ? `<a href="/api/resumes/${app.resumeId._id}/view" target="_blank" class="btn btn-outline btn-sm" style="font-size:0.75rem; padding:0.2rem 0.5rem;">
                              📄 ${escapeHtml(app.resumeId.originalName || 'Resume')}
                            </a>`
                          : '<span style="color:var(--text-muted); font-size:0.8rem;">Uploaded Resume</span>'
                      }
                    </td>
                    <td>
                      ${getStatusBadge(app.status)}
                    </td>
                    <td>
                      ${
                        canWithdraw
                          ? `<button class="btn btn-outline btn-sm" style="color:var(--danger); border-color:#fecaca;" onclick="handleWithdrawApplication('${app._id}')">
                              Withdraw
                            </button>`
                          : '<span style="color:var(--text-muted); font-size:0.8rem;">Completed</span>'
                      }
                    </td>
                  </tr>
                `;
              })
              .join('')}
          </tbody>
        </table>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">⚠️</div>
        <h3 class="empty-title">Failed to Load Applications</h3>
        <p class="empty-text">${escapeHtml(err.message)}</p>
      </div>
    `;
  }
}

async function handleWithdrawApplication(appId) {
  if (!confirm('Are you sure you want to withdraw this application? This action cannot be undone.')) return;

  try {
    await apiRequest(`/applications/${appId}/withdraw`, {
      method: 'PATCH'
    });

    showToast('Application withdrawn successfully.', 'info');
    loadMyApplications();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadMyApplications();
});

