const loginForm = document.getElementById('login-form');
const errorMsg = document.getElementById('error-msg');
const dashboard = document.getElementById('dashboard');
const loginContainer = document.getElementById('login-container');
const userNameSpan = document.getElementById('user-name');
const userRoleDiv = document.getElementById('user-role');
const adminPanel = document.getElementById('admin-panel');
const userPanel = document.getElementById('user-panel');
const logoutBtn = document.getElementById('logout-btn');

function showDashboard(user) {
  loginContainer.style.display = 'none';
  dashboard.style.display = 'block';
  userNameSpan.textContent = user.username;
  userRoleDiv.textContent = `Função: ${user.role}`;

  if (user.role === 'admin') {
    adminPanel.style.display = 'block';
    userPanel.style.display = 'none';
  } else {
    adminPanel.style.display = 'none';
    userPanel.style.display = 'block';
  }
}

function logout() {
  localStorage.removeItem('token');
  dashboard.style.display = 'none';
  loginContainer.style.display = 'block';
}

loginForm.addEventListener('submit', async e => {
  e.preventDefault();
  errorMsg.textContent = '';

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  try {
    const res = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (!res.ok) {
      errorMsg.textContent = data.message || 'Erro no login';
      return;
    }

    localStorage.setItem('token', data.token);

    const userRes = await fetch('/userdata', {
      headers: { 'Authorization': 'Bearer ' + data.token }
    });

    const userData = await userRes.json();
    showDashboard(userData);

  } catch (err) {
    errorMsg.textContent = 'Erro na conexão';
  }
});

logoutBtn.addEventListener('click', logout);

window.addEventListener('load', async () => {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    const userRes = await fetch('/userdata', {
      headers: { 'Authorization': 'Bearer ' + token }
    });

    if (!userRes.ok) {
      logout();
      return;
    }

    const userData = await userRes.json();
    showDashboard(userData);
  } catch {
    logout();
  }
});