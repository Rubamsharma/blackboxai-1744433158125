// API endpoints
const API_BASE_URL = 'http://localhost:8000/api';
const ENDPOINTS = {
    login: `${API_BASE_URL}/login`,
    studentRecords: (username) => `${API_BASE_URL}/student/records/${username}`,
    teacherClasses: (username) => `${API_BASE_URL}/teacher/classes/${username}`,
    createMeeting: `${API_BASE_URL}/create-meeting`
};

// Authentication functions
async function login(username, password, userType) {
    try {
        const response = await fetch(ENDPOINTS.login, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username,
                password,
                user_type: userType
            })
        });

        const data = await response.json();
        
        if (data.success) {
            // Store user info in localStorage
            localStorage.setItem('user', JSON.stringify({
                username,
                name: data.user.name,
                type: data.user.type
            }));

            // Redirect to appropriate dashboard
            if (userType === 'student') {
                window.location.href = '/student-dashboard.html';
            } else {
                window.location.href = '/teacher-dashboard.html';
            }
        } else {
            showError('Invalid credentials');
        }
    } catch (error) {
        console.error('Login error:', error);
        showError('An error occurred during login');
    }
}

// Student functions
async function loadStudentRecords(username) {
    try {
        const response = await fetch(ENDPOINTS.studentRecords(username));
        const data = await response.json();

        if (data.success) {
            displayStudentRecords(data.records);
        } else {
            showError('Failed to load student records');
        }
    } catch (error) {
        console.error('Error loading student records:', error);
        showError('An error occurred while loading records');
    }
}

function displayStudentRecords(records) {
    const tableBody = document.querySelector('#academic-records tbody');
    if (!tableBody) return;

    tableBody.innerHTML = '';
    
    Object.entries(records).forEach(([subject, grades]) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">${subject}</td>
            <td class="px-6 py-4 whitespace-nowrap">${grades.mid_term}</td>
            <td class="px-6 py-4 whitespace-nowrap">${grades.final}</td>
            <td class="px-6 py-4 whitespace-nowrap">${grades.grade}</td>
        `;
        tableBody.appendChild(row);
    });
}

// Teacher functions
async function loadTeacherClasses(username) {
    try {
        const response = await fetch(ENDPOINTS.teacherClasses(username));
        const data = await response.json();

        if (data.success) {
            displayTeacherClasses(data.classes);
        } else {
            showError('Failed to load teacher classes');
        }
    } catch (error) {
        console.error('Error loading teacher classes:', error);
        showError('An error occurred while loading classes');
    }
}

function displayTeacherClasses(classes) {
    const tableBody = document.querySelector('#class-management tbody');
    if (!tableBody) return;

    tableBody.innerHTML = '';
    
    classes.forEach(className => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">${className}</td>
            <td class="px-6 py-4 whitespace-nowrap">30</td>
            <td class="px-6 py-4 whitespace-nowrap">85%</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <button class="text-blue-600 hover:text-blue-800 mr-3">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="text-green-600 hover:text-green-800 mr-3">
                    <i class="fas fa-edit"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Video call functions
async function createMeeting(classId, teacherId) {
    try {
        const response = await fetch(ENDPOINTS.createMeeting, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                class_id: classId,
                teacher_id: teacherId
            })
        });

        const data = await response.json();
        
        if (data.success) {
            initializeJitsiMeet(data.meeting_id);
        } else {
            showError('Failed to create meeting');
        }
    } catch (error) {
        console.error('Error creating meeting:', error);
        showError('An error occurred while creating the meeting');
    }
}

function initializeJitsiMeet(roomName) {
    const domain = 'meet.jit.si';
    const options = {
        roomName: roomName,
        width: '100%',
        height: '100%',
        parentNode: document.querySelector('#jitsi-container'),
        interfaceConfigOverwrite: {
            TOOLBAR_BUTTONS: [
                'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
                'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
                'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
                'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
                'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone'
            ],
        }
    };
    
    const api = new JitsiMeetExternalAPI(domain, options);
    
    // Handle video call events
    api.addEventListeners({
        videoConferenceJoined: () => {
            console.log('User has joined the video conference');
        },
        videoConferenceLeft: () => {
            console.log('User has left the video conference');
        }
    });
}

// Utility functions
function showError(message) {
    // You can implement your own error display logic here
    alert(message);
}

// Initialize page based on current user
document.addEventListener('DOMContentLoaded', () => {
    const userString = localStorage.getItem('user');
    if (!userString) {
        if (window.location.pathname !== '/login.html' && 
            window.location.pathname !== '/index.html' && 
            window.location.pathname !== '/') {
            window.location.href = '/login.html';
        }
        return;
    }

    const user = JSON.parse(userString);
    
    // Update UI with user info
    const userNameElement = document.querySelector('#user-name');
    if (userNameElement) {
        userNameElement.textContent = user.name;
    }

    // Load appropriate data based on user type
    if (user.type === 'student') {
        loadStudentRecords(user.username);
    } else if (user.type === 'teacher') {
        loadTeacherClasses(user.username);
    }
});

// Handle logout
function logout() {
    localStorage.removeItem('user');
    window.location.href = '/login.html';
}
