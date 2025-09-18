const studentPanel = document.getElementById('studentPanel');
const teacherPanel = document.getElementById('teacherPanel');
const showTeacher = document.getElementById('showTeacher');
const showStudent = document.getElementById('showStudent');

// Run animation on page load for active panel
window.addEventListener('DOMContentLoaded', () => {
    const activePanel = document.querySelector('.panel.active');
    resetTypingAnimation(activePanel);
});

showTeacher.addEventListener('click', (e) => {
    e.preventDefault();
    fadeOut(studentPanel, () => {
        studentPanel.classList.remove('active');
        teacherPanel.classList.add('active');
        resetTypingAnimation(teacherPanel);
        fadeIn(teacherPanel);
    });
});

showStudent.addEventListener('click', (e) => {
    e.preventDefault();
    fadeOut(teacherPanel, () => {
        teacherPanel.classList.remove('active');
        studentPanel.classList.add('active');
        resetTypingAnimation(studentPanel);
        fadeIn(studentPanel);
    });
});

function fadeOut(element, callback) {
    element.style.opacity = 1;
    let fade = setInterval(() => {
        if (element.style.opacity > 0) {
            element.style.opacity -= 0.1;
        } else {
            clearInterval(fade);
            element.style.opacity = 0;
            element.style.visibility = 'hidden';
            callback();
        }
    }, 50);
}

function fadeIn(element) {
    element.style.opacity = 0;
    element.style.visibility = 'visible';
    let fade = setInterval(() => {
        if (element.style.opacity < 1) {
            element.style.opacity = parseFloat(element.style.opacity) + 0.1;
        } else {
            clearInterval(fade);
            element.style.opacity = 1;
        }
    }, 50);
}

// Reset typing animation (replay) function
function resetTypingAnimation(panel) {
    const lines = panel.querySelectorAll('h1 span');
    lines.forEach(line => {
        line.style.width = '0';
        line.style.animation = 'none';
        void line.offsetWidth; // trigger reflow
    });

    lines.forEach((line, index) => {
        line.style.animation = `typing 1.5s steps(20, end) ${index === 0 ? '0s' : '1.6s'} forwards`;
    });
}

// Form submit handlers
document.getElementById('studentForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const id = document.getElementById('studentId').value.trim();
    alert("Student Login with ID: " + id);
});

document.getElementById('teacherForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('teacherEmail').value.trim();
    window.location.href = 'teacherlogin.html';
});
