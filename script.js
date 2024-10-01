// Show and hide sections
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.add('hidden');
    });
    document.getElementById(sectionId).classList.remove('hidden');
}

// Login form handling
document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    fetch(`/login?username=${username}&password=${password}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showSection('optionsSection');
            } else if (data.message === 'wrong_password') {
                alert('Incorrect password.');
            } else if (data.message === 'not_signed_up') {
                alert('Please sign up first.');
            }
        });
});

// Sign up form handling
document.getElementById('signupForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const username = document.getElementById('signupUsername').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;

    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }

    fetch('/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('User registered successfully');
            showSection('loginSection');
        } else {
            alert('Signup failed: ' + data.message);
        }
    });
});

// Navigation between sections
document.getElementById('signupButton').addEventListener('click', function () {
    showSection('signupSection');
});

document.getElementById('backToLogin').addEventListener('click', function () {
    showSection('loginSection');
});

document.getElementById('addUserOption').addEventListener('click', function () {
    showSection('addUserSection');
});

document.getElementById('viewUserOption').addEventListener('click', function () {
    fetch('/view')
        .then(response => response.json())
        .then(users => {
            const userTable = document.querySelector('#userTable tbody');
            userTable.innerHTML = '';
            users.forEach(user => {
                const row = `
                    <tr>
                        <td>${user.name}</td>
                        <td>${user.phone}</td>
                        <td>${user.address}</td>
                        <td>
                            <button onclick="editUser(${user.id})">Edit</button>
                            <button onclick="deleteUser(${user.id})">Delete</button>
                        </td>
                    </tr>`;
                userTable.insertAdjacentHTML('beforeend', row);
            });
        });
    showSection('viewUserSection');
});

document.getElementById('filterButton').addEventListener('click', function () {
    const filterText = document.getElementById('filter').value.toLowerCase();

    fetch(`/filterUsers?filter=${filterText}`)
        .then(response => response.json())
        .then(users => {
            const filteredUserList = document.querySelector('#filteredUserList tbody');
            filteredUserList.innerHTML = '';
            users.forEach(user => {
                const row = `
                    <tr>
                        <td>${user.name}</td>
                        <td>${user.phone}</td>
                        <td>${user.address}</td>
                    </tr>`;
                filteredUserList.insertAdjacentHTML('beforeend', row);
            });
        });
    showSection('filterUserSection');
});

document.getElementById('newUserForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const address = document.getElementById('address').value;

    if (phone.length !== 10) {
        alert('Phone number must be 10 digits.');
        return;
    }

    fetch(`/checkPhone?phone=${phone}`)
        .then(response => response.json())
        .then(data => {
            if (data.exists) {
                alert('Phone number already exists.');
            } else {
                fetch('/save', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, address, phone, date: new Date() })
                })
                .then(response => response.json())
                .then(data => {
                    alert('User added successfully!');
                    showSection('optionsSection');
                });
            }
        });
});
