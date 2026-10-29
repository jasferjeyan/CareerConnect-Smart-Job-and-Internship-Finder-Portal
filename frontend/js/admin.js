/**
 * CareerConnect - Admin Dashboard, User & Job Moderation
 */

let allAdminUsers = [];
let allAdminJobs = [];

async function initAdminDashboard() {
  if (!requireAuth(['admin'])) return;

  loadAdminStats();
  loadAdminUsers();
  loadAdminJobs();
}

async function loadAdminStats() {
  try {
    const res = await apiRequest('/admin/stats');
    const { stats } = res;

    document.getElementById('stat-admin-students').textContent = stats.totalStudents;
    document.getElementById('stat-admin-employers').textContent = stats.totalEmployers;
    document.getElementById('stat-admin-jobs').textContent = stats.totalJobs;
    document.getElementById('stat-admin-apps').textContent = stats.totalApplications;
  } catch (err) {
    showToast('Failed to load admin stats: ' + err.message, 'error');
  }
}

// ==========================================================================
// 1. User Management
// ==========================================================================
async function loadAdminUsers() {
  const container = document.getElementById('admin-users-table');
  if (!container) return;

  container.innerHTML = `
    <tr><td colspan="6" style="text-align:center; padding:2rem; color:var(--text-muted);">
      Loading registered accounts...
    </td></tr>
  `;

  try {
    const roleFilter = document.getElementById('admin-user-role-filter')?.value || 'All';
    const searchQuery = document.getElementById('admin-user-search')?.value.trim() || '';

    const res = await apiRequest(`/admin/users?role=${roleFilter}&search=${encodeURIComponent(searchQuery)}`);
    allAdminUsers = res.users || [];

    renderAdminUsersTable();
  } catch (err) {
    container.innerHTML = `
      <tr><td colspan="6" style="text-align:center; padding:1.5rem; color:var(--danger);">
        Error loading users: ${escapeHtml(err.message)}
      </td></tr>
    `;
  }
}

function renderAdminUsersTable() {
  const container = document.getElementById('admin-users-table');
  if (!container) return;

  if (allAdminUsers.length === 0) {
    container.innerHTML = `
      <tr><td colspan="6" style="text-align:center; padding:2rem; color:var(--text-muted);">
        No users match your criteria.
      </td></tr>
    `;
    return;
  }

  container.innerHTML = allAdminUsers
    .map((u) => {
      let roleBadge = 'badge-primary';
      if (u.role === 'employer') roleBadge = 'badge-secondary';
      if (u.role === 'admin') roleBadge = 'badge-warning';

      return `
        <tr>
          <td>
            <strong>${escapeHtml(u.name)}</strong>
          </td>
          <td>${escapeHtml(u.email)}</td>
          <td><span class="badge ${roleBadge}">${u.role}</span></td>
          <td>${formatDate(u.createdAt)}</td>
          <td>
            <span class="badge ${u.isActive ? 'badge-success' : 'badge-danger'}">
              ${u.isActive ? 'Active' : 'Deactivated'}
            </span>
          </td>
          <td>
            ${
              u.role !== 'admin'
                ? `
              <div style="display:flex; gap:0.4rem;">
                <button class="btn btn-outline btn-sm" style="padding:0.25rem 0.55rem; font-size:0.75rem;" onclick="toggleUserStatus('${u._id}')">
                  ${u.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button class="btn btn-danger btn-sm" style="padding:0.25rem 0.55rem; font-size:0.75rem;" onclick="deleteUserAccount('${u._id}')">
                  Delete
                </button>
              </div>
            `
                : '<span style="font-size:0.75rem; color:var(--text-muted);">System Root</span>'
            }
          </td>
        </tr>
      `;
    })
    .join('');
}

async function toggleUserStatus(userId) {
  try {
    const res = await apiRequest(`/admin/users/${userId}/status`, {
      method: 'PATCH'
    });
    showToast(res.message, 'success');
    loadAdminUsers();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function deleteUserAccount(userId) {
  if (!confirm('Are you sure you want to permanently delete this user account and their associated records?')) return;

  try {
    const res = await apiRequest(`/admin/users/${userId}`, {
      method: 'DELETE'
    });
    showToast(res.message, 'info');
    loadAdminUsers();
    loadAdminStats();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ==========================================================================
// 2. Job Moderation
// ==========================================================================
async function loadAdminJobs() {
  const container = document.getElementById('admin-jobs-table');
  if (!container) return;

  container.innerHTML = `
    <tr><td colspan="6" style="text-align:center; padding:2rem; color:var(--text-muted);">
      Loading portal job listings...
    </td></tr>
  `;

  try {
    const status = document.getElementById('admin-job-status-filter')?.value || 'All';
    const search = document.getElementById('admin-job-search')?.value.trim() || '';

    const res = await apiRequest(`/admin/jobs?status=${status}&search=${encodeURIComponent(search)}`);
    allAdminJobs = res.jobs || [];

    renderAdminJobsTable();
  } catch (err) {
    container.innerHTML = `
      <tr><td colspan="6" style="text-align:center; padding:1.5rem; color:var(--danger);">
        Error loading jobs: ${escapeHtml(err.message)}
      </td></tr>
    `;
  }
}

function renderAdminJobsTable() {
  const container = document.getElementById('admin-jobs-table');
  if (!container) return;

  if (allAdminJobs.length === 0) {
    container.innerHTML = `
      <tr><td colspan="6" style="text-align:center; padding:2rem; color:var(--text-muted);">
        No jobs found.
      </td></tr>
    `;
    return;
  }

  container.innerHTML = allAdminJobs
    .map((j) => {
      return `
        <tr>
          <td>
            <a href="/job-details.html?id=${j._id}" style="font-weight:700; color:var(--text-main);" target="_blank">
              ${escapeHtml(j.title)} ↗
            </a>
            <div style="font-size:0.8rem; color:var(--text-muted);">${escapeHtml(j.companyName)}</div>
          </td>
          <td><span class="badge badge-primary">${escapeHtml(j.jobType)}</span></td>
          <td>${escapeHtml(j.category)}</td>
          <td>${formatDate(j.createdAt)}</td>
          <td>
            <span class="badge ${j.status === 'Active' ? 'badge-success' : 'badge-danger'}">${j.status}</span>
          </td>
          <td>
            <div style="display:flex; gap:0.4rem;">
              <a href="/job-details.html?id=${j._id}" class="btn btn-outline btn-sm" style="padding:0.25rem 0.55rem; font-size:0.75rem;">
                View
              </a>
              <button class="btn btn-danger btn-sm" style="padding:0.25rem 0.55rem; font-size:0.75rem;" onclick="deleteJobAdmin('${j._id}')">
                Remove
              </button>
            </div>
          </td>
        </tr>
      `;
    })
    .join('');
}

async function deleteJobAdmin(jobId) {
  if (!confirm('Are you sure you want to remove this job listing? It will be deleted from the database.')) return;

  try {
    const res = await apiRequest(`/admin/jobs/${jobId}`, {
      method: 'DELETE'
    });
    showToast(res.message, 'info');
    loadAdminJobs();
    loadAdminStats();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initAdminDashboard();

  // Filter change listeners
  document.getElementById('admin-user-role-filter')?.addEventListener('change', loadAdminUsers);
  document.getElementById('admin-user-search')?.addEventListener('input', () => {
    clearTimeout(window.userSearchTimeout);
    window.userSearchTimeout = setTimeout(loadAdminUsers, 300);
  });

  document.getElementById('admin-job-status-filter')?.addEventListener('change', loadAdminJobs);
  document.getElementById('admin-job-search')?.addEventListener('input', () => {
    clearTimeout(window.jobSearchTimeout);
    window.jobSearchTimeout = setTimeout(loadAdminJobs, 300);
  });
});

