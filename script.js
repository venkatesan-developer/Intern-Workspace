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

    // Send data to the server to check for phone number duplication
    fetch(`/checkPhone?phone=${phone}`)
        .then(response => response.json())
        .then(data => {
            if (data.exists) {
                alert('Phone number already exists.');
            } else {
                // Get current date and time in ISO format
                const currentDateTime = new Date().toISOString();

                // Send data to the server in JSON format with the current date and time
                fetch('/save', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ name, address, phone, date: currentDateTime }),
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
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });
});

document.getElementById('viewButton').addEventListener('click', function() {
    fetch('/view')
        .then(response => response.json())
        .then(data => {
            const userList = document.getElementById('userList');
            userList.innerHTML = '<h2>User List</h2>';
            data.forEach(user => {
                userList.innerHTML += `
                    <p>ID: ${user.id}, Name: ${user.name}, Address: ${user.address}, 
                    Phone: ${user.phone}, Date: ${new Date(user.date).toLocaleString()}
                    <button onclick="triggerWebhook(${user.id})">Send Notification</button>
                    </p>`;
            });
        })
        .catch((error) => {
            console.error('Error:', error);
        });
});

document.getElementById('clearButton').addEventListener('click', function() {
    document.getElementById('userList').innerHTML = '';
});

// Trigger webhook when saved data is clicked
function triggerWebhook(id) {
    fetch(`/webhook/${id}`)
        .then(response => {
            if (!response.ok) throw new Error('Failed to trigger webhook.');
            alert('Webhook triggered successfully!');
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}
