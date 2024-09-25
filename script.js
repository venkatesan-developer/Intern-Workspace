document.getElementById('userForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const name = document.getElementById('name').value;
    const address = document.getElementById('address').value;
    const phone = document.getElementById('phone').value;

    // Validate phone number
    if (phone.length !== 10 || isNaN(phone)) {
        alert("Phone number must be exactly 10 digits.");
        return;
    }

    // Send data to the server
    fetch('/save', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, address, phone }),
    })
    .then(response => {
        if (!response.ok) throw new Error('Failed to save user data.');
        return response.json();
    })
    .then(data => {
        alert('User saved successfully!');
        document.getElementById('userForm').reset();
    })
    .catch((error) => {
        console.error('Error:', error);
    });
});
document.getElementById('viewButton').addEventListener('click', function() {
    const fromDate = document.getElementById('fromDate').value;
    const toDate = document.getElementById('toDate').value;

    let url = '/view';
    if (fromDate && toDate) {
        url += `?fromDate=${fromDate}&toDate=${toDate}`;
    }

    fetch(url)
    .then(response => response.json())
    .then(data => {
        const userList = document.getElementById('userList');
        userList.innerHTML = '<h2>User List</h2>';
        data.forEach(user => {
            userList.innerHTML += `<p>ID: ${user.id}, Name: ${user.name}, Address: ${user.address}, Phone: ${user.phone}, Date: ${user.date}</p>`;
        });
    })
    .catch((error) => {
        console.error('Error:', error);
    });
});

document.getElementById('clearButton').addEventListener('click', function() {
    document.getElementById('userList').innerHTML = '';
});
