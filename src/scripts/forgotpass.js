document.addEventListener('DOMContentLoaded', function () {
	const forgotForm = document.getElementById('forgotpass-form');
	const emailInput = forgotForm.querySelector('input[name="email"]');
	const submitBtn = forgotForm.querySelector('button[type="submit"]');

	const verificationForm = document.createElement('form');
	verificationForm.className = 'login-form';
	verificationForm.style.display = 'none';
	verificationForm.innerHTML = `
		<h2>Verify Code</h2>
		<input type="text" name="code" placeholder="Verification Code" required />
		<button type="submit" class="join-btn">Verify</button>
	`;
	forgotForm.parentNode.appendChild(verificationForm);

	const resetForm = document.createElement('form');
	resetForm.className = 'login-form';
	resetForm.style.display = 'none';
	resetForm.innerHTML = `
		<h2>Reset Password</h2>
		<input type="password" name="newpassword" placeholder="New Password" required />
		<input type="password" name="confirmpassword" placeholder="Confirm Password" required />
		<button type="submit" class="join-btn">Reset Password</button>
	`;
	forgotForm.parentNode.appendChild(resetForm);

	forgotForm.addEventListener('submit', async function (e) {
		e.preventDefault();
		submitBtn.disabled = true;
		submitBtn.textContent = 'Sending...';
		const email = emailInput.value.trim();
		const result = await window.accounts.requestPasswordReset(email);
		if (typeof result === 'string') {
			alert(result);
			submitBtn.disabled = false;
			submitBtn.textContent = 'Send Reset Link';
			return;
		}
		if (result.status === 0) {
			alert('If this email is registered, a reset code has been sent. Please check your email.');
			forgotForm.style.display = 'none';
			verificationForm.style.display = 'flex';
		} else if (result.status === 1) {
			alert('You are sending requests too quickly. Please wait and try again.');
		} else if (result.status === 2) {
			alert('This email is not attached to an account.');
		} else {
			alert('An unknown error occurred. Code: ' + result.status);
		}
		submitBtn.disabled = false;
		submitBtn.textContent = 'Send Reset Link';
	});

	verificationForm.addEventListener('submit', async function (e) {
		e.preventDefault();
		const codeInput = verificationForm.querySelector('input[name="code"]');
		const code = codeInput.value.trim();
		const verified = await window.accounts.verifyResetCode(code);
		if (verified) {
			alert('Code verified! You may now reset your password.');
			verificationForm.style.display = 'none';
			resetForm.style.display = 'flex';
		} else {
			alert('Invalid or expired code. Please try again.');
		}
	});

	resetForm.addEventListener('submit', async function (e) {
		e.preventDefault();
		const newPass = resetForm.querySelector('input[name="newpassword"]').value;
		const confirmPass = resetForm.querySelector('input[name="confirmpassword"]').value;
		if (newPass !== confirmPass) {
			alert('Passwords do not match.');
			return;
		}
		const result = await window.accounts.editAccount({ password: newPass });
		if (result === true) {
			alert('Password reset successful! You may now log in.');
			window.location.href = '/login';
		} else if (typeof result === 'string') {
			alert(result);
		} else {
			alert('Failed to reset password. Please try again.');
		}
	});
});
