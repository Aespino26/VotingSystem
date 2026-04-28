const apiBase = '/api';

function getToken() {
  return localStorage.getItem('evote_token');
}

function getUser() {
  const raw = localStorage.getItem('evote_user');
  return raw ? JSON.parse(raw) : null;
}

function setSession(token, user) {
  localStorage.setItem('evote_token', token);
  localStorage.setItem('evote_user', JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem('evote_token');
  localStorage.removeItem('evote_user');
}

function authFetch(url, options = {}) {
  const token = getToken();
  const isFormData = options.body instanceof FormData;
  const headers = { ...(isFormData ? {} : { 'Content-Type': 'application/json' }), ...(options.headers || {}) };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return fetch(url, { ...options, headers });
}

function redirectToLogin() {
  clearSession();
  window.location.href = '/';
}

function showMessage(container, text, type = 'error') {
  if (!container) return;
  container.textContent = text;
  container.classList.remove('error', 'success');
  container.classList.add(type);
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function setLoading(container, text = 'Loading...') {
  container.innerHTML = `<div class="loading-state">${escapeHtml(text)}</div>`;
}

function setEmpty(container, text) {
  container.innerHTML = `<div class="empty-state">${escapeHtml(text)}</div>`;
}

function pluralizeVote(count) {
  return `${count} vote${count === 1 ? '' : 's'}`;
}

function getInitials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return (parts[0]?.[0] || 'C') + (parts[1]?.[0] || '');
}

function candidateAvatar(candidate, sizeClass = '') {
  const imageUrl = candidate.imageUrl ? escapeHtml(candidate.imageUrl) : '';
  const initials = escapeHtml(getInitials(candidate.name || 'Candidate').toUpperCase());

  if (imageUrl) {
    return `<img class="candidate-avatar ${sizeClass}" src="${imageUrl}" alt="${escapeHtml(candidate.name)} photo" loading="lazy" />`;
  }

  return `<div class="candidate-avatar placeholder ${sizeClass}" aria-hidden="true">${initials}</div>`;
}

async function handleLogin(event) {
  event.preventDefault();
  const studentId = document.getElementById('studentId').value.trim();
  const password = document.getElementById('password').value.trim();
  const message = document.getElementById('message');

  if (!studentId || !password) {
    showMessage(message, 'Student ID and password are required.');
    return;
  }

  try {
    const res = await fetch(`${apiBase}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, password }),
    });

    if (!res.ok) {
      const error = await res.json();
      showMessage(message, error.message || 'Login failed.');
      return;
    }

    const body = await res.json();
    setSession(body.access_token, body.user);

    if (body.user.role === 'admin') {
      window.location.href = '/admin.html';
    } else {
      window.location.href = '/student.html';
    }
  } catch (err) {
    showMessage(message, 'Unable to sign in.');
    console.error(err);
  }
}

async function handleRegister(event) {
  event.preventDefault();
  const studentId = document.getElementById('studentId').value.trim();
  const name = document.getElementById('name').value.trim();
  const password = document.getElementById('password').value.trim();
  const confirmPassword = document.getElementById('confirmPassword').value.trim();
  const message = document.getElementById('message');

  if (!studentId || !name || !password) {
    showMessage(message, 'All fields are required.');
    return;
  }

  if (password !== confirmPassword) {
    showMessage(message, 'Passwords do not match.');
    return;
  }

  if (password.length < 4) {
    showMessage(message, 'Password must be at least 4 characters.');
    return;
  }

  try {
    const res = await fetch(`${apiBase}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, name, password }),
    });

    if (!res.ok) {
      const error = await res.json();
      showMessage(message, error.message || 'Registration failed.');
      return;
    }

    const body = await res.json();
    setSession(body.access_token, body.user);
    showMessage(message, 'Registration successful! Redirecting...', 'success');
    setTimeout(() => {
      window.location.href = '/student.html';
    }, 1000);
  } catch (err) {
    showMessage(message, 'Unable to register.');
    console.error(err);
  }
}

async function ensureLoggedIn(redirect = true) {
  const user = getUser();
  if (!user || !getToken()) {
    if (redirect) redirectToLogin();
    return null;
  }
  return user;
}

async function loadCandidates() {
  const container = document.getElementById('candidates');
  setLoading(container, 'Loading candidates...');

  const res = await authFetch(`${apiBase}/candidates`);
  if (!res.ok) {
    setEmpty(container, 'Unable to load candidates.');
    return;
  }

  const candidates = await res.json();
  if (!candidates.length) {
    setEmpty(container, 'No candidates are available yet.');
    return;
  }

  const byPosition = candidates.reduce((acc, candidate) => {
    (acc[candidate.position] = acc[candidate.position] || []).push(candidate);
    return acc;
  }, {});

  const htmlSections = Object.entries(byPosition).map(([position, list]) => {
    const radios = list
      .map(
        (c) =>
          `<label class="radio candidate-option">
            <input type="radio" name="${escapeHtml(position)}" value="${c.id}" />
            ${candidateAvatar(c)}
            <span>
              <span class="candidate-name">${escapeHtml(c.name)}</span>
              <span class="candidate-description">${escapeHtml(c.description || 'No description provided.')}</span>
            </span>
          </label>`,
      )
      .join('');
    return `
      <div class="position-group">
        <div class="position-header">
          <h3>${escapeHtml(position)}</h3>
          <span class="count-pill">${list.length} candidate${list.length === 1 ? '' : 's'}</span>
        </div>
        ${radios}
      </div>
    `;
  });

  container.innerHTML = htmlSections.join('');
}

async function loadMyVotes() {
  const container = document.getElementById('myVotes');
  setLoading(container);
  const res = await authFetch(`${apiBase}/votes/me`);
  if (!res.ok) {
    setEmpty(container, 'Unable to load your votes.');
    return;
  }
  const votes = await res.json();
  if (!votes.length) {
    setEmpty(container, 'You have not voted yet.');
    return;
  }

  const items = votes
    .map((vote) => `
      <div class="list-row media-row">
        ${candidateAvatar(vote.candidate, 'small')}
        <div>
          <strong>${escapeHtml(vote.candidate.position)}</strong>
          <span class="muted">${escapeHtml(vote.candidate.name)}</span>
        </div>
        <div class="muted">${new Date(vote.createdAt).toLocaleString()}</div>
      </div>
    `)
    .join('');

  container.innerHTML = items;
}

async function loadResults() {
  const container = document.getElementById('results');
  setLoading(container);
  const res = await authFetch(`${apiBase}/votes/results`);
  if (!res.ok) {
    setEmpty(container, 'Unable to load results.');
    return;
  }
  const results = await res.json();
  if (!results.length) {
    setEmpty(container, 'No votes yet.');
    return;
  }

  const byPosition = results.reduce((acc, item) => {
    (acc[item.position] = acc[item.position] || []).push(item);
    return acc;
  }, {});

  const htmlSections = Object.entries(byPosition)
    .map(([position, items]) => {
      const rows = items
        .map(
          (item) =>
            `<div class="list-row">
              <div>
                <strong>${escapeHtml(item.name)}</strong>
                <span class="muted">${escapeHtml(position)}</span>
              </div>
              <div class="result-value">${pluralizeVote(item.votes)}</div>
            </div>`,
        )
        .join('');
      return `
        <div class="position-group">
          <div class="position-header">
            <h3>${escapeHtml(position)}</h3>
            <span class="count-pill">${items.length} result${items.length === 1 ? '' : 's'}</span>
          </div>
          <div class="stacked-list position-body">${rows}</div>
        </div>
      `;
    })
    .join('');

  container.innerHTML = htmlSections;
}

async function submitSelectedVotes() {
  const message = document.getElementById('voteMessage');
  message.textContent = '';

  const radios = document.querySelectorAll('input[type=radio]:checked');
  if (!radios.length) {
    showMessage(message, 'Select one candidate for each position before submitting.');
    return;
  }

  const candidateIds = Array.from(radios).map((input) => Number(input.value));

  for (const id of candidateIds) {
    const res = await authFetch(`${apiBase}/votes`, {
      method: 'POST',
      body: JSON.stringify({ candidateId: id }),
    });

    if (!res.ok) {
      const error = await res.json();
      showMessage(message, error.message || 'Vote failed.');
      return;
    }
  }

  showMessage(message, 'Your vote has been recorded.', 'success');
  await loadMyVotes();
  await loadResults();
}

async function loadAdminCandidates() {
  const container = document.getElementById('candidateList');
  setLoading(container);

  const res = await authFetch(`${apiBase}/candidates`);
  if (!res.ok) {
    setEmpty(container, 'Unable to load candidates.');
    return;
  }
  const candidates = await res.json();

  if (!candidates.length) {
    setEmpty(container, 'No candidates yet.');
    return;
  }

  const html = candidates
    .map((c) => {
      return `
        <div class="list-row media-row">
          ${candidateAvatar(c, 'small')}
          <div>
            <strong>${escapeHtml(c.name)}</strong>
            <span class="muted">${escapeHtml(c.position)}${c.description ? ` - ${escapeHtml(c.description)}` : ''}</span>
          </div>
          <div class="list-actions">
            <button type="button" class="secondary" data-action="edit" data-id="${c.id}">Edit</button>
            <button type="button" class="danger" data-action="delete" data-id="${c.id}">Delete</button>
          </div>
        </div>
      `;
    })
    .join('');

  container.innerHTML = html;
}

async function createOrUpdateCandidate(event) {
  event.preventDefault();
  const id = document.getElementById('candidateId').value;
  const name = document.getElementById('candidateName').value.trim();
  const position = document.getElementById('candidatePosition').value.trim();
  const description = document.getElementById('candidateDescription').value.trim();
  const image = document.getElementById('candidateImage').files[0];
  const message = document.getElementById('candidateMessage');

  if (!name || !position) {
    showMessage(message, 'Name and position are required.');
    return;
  }

  const payload = new FormData();
  payload.append('name', name);
  payload.append('position', position);
  payload.append('description', description);
  if (image) {
    payload.append('image', image);
  }

  const url = id ? `${apiBase}/candidates/${id}` : `${apiBase}/candidates`;
  const method = id ? 'PUT' : 'POST';

  const res = await authFetch(url, { method, body: payload });
  if (!res.ok) {
    const error = await res.json();
    showMessage(message, error.message || 'Unable to save candidate.');
    return;
  }

  showMessage(message, 'Saved successfully!', 'success');
  resetCandidateForm();
  await loadAdminCandidates();
  await loadResults();
}

function resetCandidateForm() {
  document.getElementById('candidateId').value = '';
  document.getElementById('candidateName').value = '';
  document.getElementById('candidatePosition').value = '';
  document.getElementById('candidateDescription').value = '';
  document.getElementById('candidateImage').value = '';
  updateCandidateImagePreview();
}

function updateCandidateImagePreview(candidate) {
  const preview = document.getElementById('candidateImagePreview');
  const input = document.getElementById('candidateImage');
  if (!preview || !input) return;

  const file = input.files?.[0];
  if (file) {
    const previewUrl = URL.createObjectURL(file);
    preview.innerHTML = `
      <img class="candidate-avatar" src="${previewUrl}" alt="Selected candidate photo preview" />
      <span class="muted">${escapeHtml(file.name)}</span>
    `;
    return;
  }

  if (candidate?.imageUrl) {
    preview.innerHTML = `
      ${candidateAvatar(candidate)}
      <span class="muted">Current photo. Choose a new file to replace it.</span>
    `;
    return;
  }

  preview.innerHTML = `
    <div class="candidate-avatar placeholder" aria-hidden="true">EV</div>
    <span class="muted">No photo selected.</span>
  `;
}

async function handleCandidateAction(event) {
  const button = event.target.closest('button');
  if (!button) return;
  const action = button.dataset.action;
  const id = Number(button.dataset.id);
  const message = document.getElementById('candidateMessage');

  if (action === 'edit') {
    const res = await authFetch(`${apiBase}/candidates`);
    if (!res.ok) return;
    const candidates = await res.json();
    const candidate = candidates.find((c) => c.id === id);
    if (!candidate) return;

    document.getElementById('candidateId').value = candidate.id;
    document.getElementById('candidateName').value = candidate.name;
    document.getElementById('candidatePosition').value = candidate.position;
    document.getElementById('candidateDescription').value = candidate.description || '';
    document.getElementById('candidateImage').value = '';
    updateCandidateImagePreview(candidate);
    showMessage(message, 'Editing candidate. Make changes and click Save.', 'success');
  }

  if (action === 'delete') {
    const proceed = confirm('Delete this candidate?');
    if (!proceed) return;

    const res = await authFetch(`${apiBase}/candidates/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json();
      showMessage(message, err.message || 'Unable to delete candidate.');
      return;
    }

    showMessage(message, 'Deleted.', 'success');
    await loadAdminCandidates();
    await loadResults();
  }
}

function applyPageLogic() {
  if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    return;
  }

  if (document.getElementById('registerForm')) {
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    return;
  }

  const user = getUser();
  if (!user) {
    redirectToLogin();
    return;
  }

  const userBadge = document.getElementById('userBadge');
  if (userBadge) {
    userBadge.textContent = user.name || user.studentId || user.role;
  }

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => redirectToLogin());
  }

  if (window.location.pathname.endsWith('student.html')) {
    if (user.role === 'admin') {
      // Admin should not use student page
      window.location.href = '/admin.html';
      return;
    }

    loadCandidates();
    loadMyVotes();
    loadResults();

    const submitVoteButton = document.getElementById('submitVote');
    if (submitVoteButton) {
      submitVoteButton.addEventListener('click', submitSelectedVotes);
    }
  }

  if (window.location.pathname.endsWith('admin.html')) {
    if (user.role !== 'admin') {
      // Prevent non-admin access to admin page
      window.location.href = '/student.html';
      return;
    }

    loadAdminCandidates();
    loadResults();

    const form = document.getElementById('candidateForm');
    form.addEventListener('submit', createOrUpdateCandidate);
    document.getElementById('candidateImage').addEventListener('change', () => updateCandidateImagePreview());
    document.getElementById('cancelEdit').addEventListener('click', () => {
      resetCandidateForm();
      showMessage(document.getElementById('candidateMessage'), 'Edit cancelled.', 'error');
    });

    document.getElementById('candidateList').addEventListener('click', handleCandidateAction);
  }
}


window.addEventListener('DOMContentLoaded', applyPageLogic);
