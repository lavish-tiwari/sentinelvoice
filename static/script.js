let lastUserSpeech = "";
let currentMode = "assistant";
let interviewLevel = "beginner";

// 🌊 Canvas Setup
let canvas = document.getElementById("waveCanvas");
let ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = 150;

let amplitude = 10;
let waveColor = "#22c55e";

// 🌊 Wave Animation
function drawWave() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.beginPath();
    ctx.lineWidth = 3;
    ctx.strokeStyle = waveColor;

    for (let x = 0; x < canvas.width; x++) {
        let y = canvas.height / 2 +
            Math.sin((x + Date.now() / 5) * 0.02) * amplitude;

        ctx.lineTo(x, y);
    }

    ctx.stroke();
    requestAnimationFrame(drawWave);
}

drawWave();

// 🎤 START LISTENING
function startListening() {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = "en-US";

    document.getElementById("wave-container").classList.remove("hidden");
    amplitude = 40;

    recognition.onresult = function(event) {
        let text = event.results[0][0].transcript;
        lastUserSpeech = text;

        let output = document.getElementById("output");

        output.innerText = "You: " + text + "\nAI: Thinking...";

        fetch("/process", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                text: text,
                mode: currentMode,
                level: interviewLevel
            })
        })
        .then(res => res.json())
        .then(data => {
            let reply = data.response;

            output.innerText = "You: " + text + "\nAI: " + reply;

            // 🎧 Murf audio (PRIMARY)
            if (data.audio) {
                let audio = new Audio(data.audio);
                audio.play();
            } else {
                speak(reply); // fallback
            }

            amplitude = 10;
            document.getElementById("wave-container").classList.add("hidden");
        });
    };

    recognition.start();
}

// 🛡️ SECURITY CHECK
function fakeScam() {
    let output = document.getElementById("output");

    if (!lastUserSpeech) {
        output.innerText = "AI: No voice input detected.";
        speak("No voice input detected.");
        return;
    }

    output.innerText = "AI: Analyzing...";
    speak("Analyzing your speech");

    setTimeout(() => {
        let suspiciousWords = ["urgent", "transfer", "send money", "otp"];

        let isSuspicious = suspiciousWords.some(word =>
            lastUserSpeech.toLowerCase().includes(word)
        );

        let msg = isSuspicious
            ? "This sounds suspicious. Please be cautious."
            : "This seems safe. No concerns detected.";

        output.innerText += "\nAI: " + msg;
        speak(msg);
    }, 2000);
}

// 🔊 FALLBACK VOICE
function speak(text) {
    let speech = new SpeechSynthesisUtterance(text);

    speech.lang = "en-US";
    speech.rate = 0.85;

    let voices = window.speechSynthesis.getVoices();
    speech.voice = voices.find(v => v.name.includes("Google")) || voices[0];

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(speech);
}

// 🎯 MODE SWITCH
function setMode(mode) {
    currentMode = mode;

    document.getElementById("mode").innerText =
        "Mode: " + mode.toUpperCase();

    let levelControls = document.getElementById("levelControls");

    if (mode === "interview") {
        levelControls.style.display = "block";
    } else {
        levelControls.style.display = "none";
    }

    // 🎨 Wave color change
    if (mode === "interview") waveColor = "#ef4444";
    else if (mode === "security") waveColor = "#facc15";
    else waveColor = "#22c55e";
}

// 🎯 INTERVIEW LEVEL
function setLevel(level) {
    interviewLevel = level;

    document.getElementById("mode").innerText =
        "Mode: INTERVIEW (" + level.toUpperCase() + ")";
}