// Camera and photo capture logic for registration.html

async function getCameraStream() {
    try {
        return await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    } catch (e) {
        alert('Camera access denied or not available.');
        throw e;
    }
}

let stream;
const videoFront = document.getElementById('videoFront');
const videoLeft = document.getElementById('videoLeft');
const videoRight = document.getElementById('videoRight');

getCameraStream().then(s => {
    stream = s;
    [videoFront, videoLeft, videoRight].forEach(v => v.srcObject = stream);
});

function capturePhoto(video, canvas, captureBtn, resetBtn) {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    video.style.display = 'none';
    canvas.style.display = 'block';
    if (captureBtn) captureBtn.style.display = 'none';
    if (resetBtn) resetBtn.style.display = 'inline-block';
}

function resetPhoto(video, canvas, captureBtn, resetBtn) {
    video.style.display = 'block';
    canvas.style.display = 'none';
    if (captureBtn) captureBtn.style.display = 'inline-block';
    if (resetBtn) resetBtn.style.display = 'none';
}

document.getElementById('captureFront').onclick = function() {
    capturePhoto(
        videoFront,
        document.getElementById('canvasFront'),
        this,
        document.getElementById('resetFront')
    );
};
document.getElementById('resetFront').onclick = function() {
    resetPhoto(
        videoFront,
        document.getElementById('canvasFront'),
        document.getElementById('captureFront'),
        this
    );
};

document.getElementById('captureLeft').onclick = function() {
    capturePhoto(
        videoLeft,
        document.getElementById('canvasLeft'),
        this,
        document.getElementById('resetLeft')
    );
};
document.getElementById('resetLeft').onclick = function() {
    resetPhoto(
        videoLeft,
        document.getElementById('canvasLeft'),
        document.getElementById('captureLeft'),
        this
    );
};

document.getElementById('captureRight').onclick = function() {
    capturePhoto(
        videoRight,
        document.getElementById('canvasRight'),
        this,
        document.getElementById('resetRight')
    );
};
document.getElementById('resetRight').onclick = function() {
    resetPhoto(
        videoRight,
        document.getElementById('canvasRight'),
        document.getElementById('captureRight'),
        this
    );
};

document.getElementById('registrationForm').onsubmit = async function(e) {
    e.preventDefault();
    const allCaptured = ['canvasFront','canvasLeft','canvasRight'].every(id =>
        document.getElementById(id).style.display === 'block'
    );
    if (!allCaptured) {
        document.getElementById('success').textContent = 'Please capture all three photos.';
        return;
    }
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    if (password !== confirmPassword) {
        document.getElementById('success').textContent = 'Passwords do not match.';
        return;
    }

    // Collect form data
    const data = {
        collegeMail: document.getElementById('collegeMail').value,
        rollNo: document.getElementById('rollNo').value,
        regNo: document.getElementById('regNo').value,
        studentName: document.getElementById('studentName').value,
        phoneNumber: document.getElementById('phoneNumber').value,
        deptSection: document.getElementById('deptSection').value,
        pepHope: document.getElementById('pepHope').value,
        year: document.getElementById('year').value,
        password: password,
        photoFront: document.getElementById('canvasFront').toDataURL('image/png'),
        photoLeft: document.getElementById('canvasLeft').toDataURL('image/png'),
        photoRight: document.getElementById('canvasRight').toDataURL('image/png')
    };

    // Send to Flask API
    try {
        const resp = await fetch('http://192.168.124.61:5600/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await resp.json();
        document.getElementById('success').textContent = result.message || 'Registration successful!';
    } catch (err) {
        document.getElementById('success').textContent = 'Error submitting registration.';
    }
};

function toggleMenu() {
  document.getElementById("navMenu").classList.toggle("show");
}



