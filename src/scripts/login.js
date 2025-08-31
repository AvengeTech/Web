document.addEventListener('DOMContentLoaded', function () {
	const form = document.querySelector('.login-form');
	const usernameInput = form.querySelector('input[name="username"]');
	const passwordInput = form.querySelector('input[name="password"]');
	const submitBtn = form.querySelector('button[type="submit"]');

	form.addEventListener('submit', async function (e) {
		e.preventDefault();
		submitBtn.disabled = true;
		submitBtn.textContent = 'Logging in...';
		const username = usernameInput.value.trim();
		const password = passwordInput.value;
		const result = await window.accounts.loadAccount(username, password);
		if (result && result.name) {
			window.location.href = '/account';
		} else if (typeof result === 'string') {
			alert(result);
			submitBtn.disabled = false;
			submitBtn.textContent = 'Log In';
		} else {
			alert('Login failed. Please check your credentials.');
			submitBtn.disabled = false;
			submitBtn.textContent = 'Log In';
		}
	});
});
