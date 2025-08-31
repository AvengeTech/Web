document.addEventListener('DOMContentLoaded', function () {
	const form = document.getElementById('signup-form');
	const nameInput = form.querySelector('input[name="name"]');
	const emailInput = form.querySelector('input[name="email"]');
	const passwordInput = form.querySelector('input[name="password"]');
	const submitBtn = form.querySelector('button[type="submit"]');

	form.addEventListener('submit', async function (e) {
		e.preventDefault();
		submitBtn.disabled = true;
		submitBtn.textContent = 'Signing up...';
		const name = nameInput.value.trim();
		const email = emailInput.value.trim();
		const password = passwordInput.value;
		const result = await window.accounts.createNewAccount(email, name, password);
		if (result === true) {
			window.location.href = '/account';
		} else if (typeof result === 'string') {
			alert(result);
			submitBtn.disabled = false;
			submitBtn.textContent = 'Sign Up';
		} else {
			alert('Sign up failed. Please try again.');
			submitBtn.disabled = false;
			submitBtn.textContent = 'Sign Up';
		}
	});
});
