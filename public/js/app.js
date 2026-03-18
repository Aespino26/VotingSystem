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
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
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
  container.innerHTML = 'Loading candidates...';

  const res = await authFetch(`${apiBase}/candidates`);
  if (!res.ok) {
    container.textContent = 'Unable to load candidates.';
    return;
  }

  const candidates = await res.json();
  const byPosition = candidates.reduce((acc, candidate) => {
    (acc[candidate.position] = acc[candidate.position] || []).push(candidate);
    return acc;
  }, {});

  const htmlSections = Object.entries(byPosition).map(([position, list]) => {
    const radios = list
      .map(
        (c) =>
          `<label class="radio"><input type="radio" name="${position}" value="${c.id}" /> ${c.name} <span class="muted">(${c.description || 'No description'})</span></label>`,
      )
      .join('');
    return `<div class="position-group"><h3>${position}</h3>${radios}</div>`;
  });

  container.innerHTML = htmlSections.join('');
}

async function loadMyVotes() {
  const container = document.getElementById('myVotes');
  container.textContent = 'Loading...';
  const res = await authFetch(`${apiBase}/votes/me`);
  if (!res.ok) {
    container.textContent = 'Unable to load your votes.';
    return;
  }
  const votes = await res.json();
  if (!votes.length) {
    container.textContent = 'You have not voted yet.';
    return;
  }

  const items = votes
    .map((vote) => `
      <div class="list-row">
        <div>
          <strong>${vote.candidate.position}</strong>: ${vote.candidate.name}
        </div>
        <div class="muted">${new Date(vote.createdAt).toLocaleString()}</div>
      </div>
    `)
    .join('');

  container.innerHTML = items;
}

async function loadResults() {
  const container = document.getElementById('results');
  container.textContent = 'Loading...';
  const res = await authFetch(`${apiBase}/votes/results`);
  if (!res.ok) {
    container.textContent = 'Unable to load results.';
    return;
  }
  const results = await res.json();
  if (!results.length) {
    container.textContent = 'No votes yet.';
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
            `<div class="list-row"><div>${item.name}</div><div>${item.votes} vote${item.votes === 1 ? '' : 's'}</div></div>`,
        )
        .join('');
      return `<div class="position-group"><h3>${position}</h3>${rows}</div>`;
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
  container.textContent = 'Loading...';

  const res = await authFetch(`${apiBase}/candidates`);
  if (!res.ok) {
    container.textContent = 'Unable to load candidates.';
    return;
  }
  const candidates = await res.json();

  if (!candidates.length) {
    container.textContent = 'No candidates yet.';
    return;
  }

  const html = candidates
    .map((c) => {
      return `
        <div class="list-row">
          <div>
            <strong>${c.position}</strong>: ${c.name} <span class="muted">${c.description || ''}</span>
          </div>
          <div class="list-actions">
            <button type="button" data-action="edit" data-id="${c.id}">Edit</button>
            <button type="button" data-action="delete" data-id="${c.id}">Delete</button>
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
  const message = document.getElementById('candidateMessage');

  if (!name || !position) {
    showMessage(message, 'Name and position are required.');
    return;
  }

  const payload = { name, position, description };
  const url = id ? `${apiBase}/candidates/${id}` : `${apiBase}/candidates`;
  const method = id ? 'PUT' : 'POST';

  const res = await authFetch(url, { method, body: JSON.stringify(payload) });
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
    document.getElementById('cancelEdit').addEventListener('click', () => {
      resetCandidateForm();
      showMessage(document.getElementById('candidateMessage'), 'Edit cancelled.', 'error');
    });

    document.getElementById('candidateList').addEventListener('click', handleCandidateAction);
  }
}


window.addEventListener('DOMContentLoaded', applyPageLogic);
