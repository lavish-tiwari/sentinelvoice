let lastUserSpeech = "";
let currentMode = "assistant";
let interviewLevel = "beginner";

let canvas = document.getElementById("waveCanvas");
let ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = 150;

let amplitude = 10;
let waveColor = "#22c55e";

// 🌊 Draw Siri-like wave
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

// 🎤 Start listening
function startListening() {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = "en-US";

    // show wave + increase amplitude
    document.getElementById("wave-container").classList.remove("hidden");
    amplitude = 40;

    recognition.onresult = function(event) {
        let text = event.results[0][0].transcript;
        lastUserSpeech = text;

        document.getElementById("output").innerText = "You: " + text;
        document.getElementById("output").innerText += "\nAI: Thinking...";
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

            document.getElementById("output").innerText += "\nAI: " + reply;

            speak(reply);

            // reduce wave after speaking
            amplitude = 10;
            document.getElementById("wave-container").classList.add("hidden");
        });
    };

    recognition.start();
}

// 🛡️ Scam Detection
function fakeScam() {
    let output = document.getElementById("output");

    if (!lastUserSpeech) {
        output.innerText = "AI: No voice input detected. Please speak first.";
        speak("No voice input detected. Please speak first.");
        return;
    }

    output.innerText = "AI: Let me think for a second...";
    speak("Let me think for a second");

    setTimeout(() => {
        let suspiciousWords = ["urgent", "transfer", "send money", "otp"];

        let isSuspicious = suspiciousWords.some(word =>
            lastUserSpeech.toLowerCase().includes(word)
        );

        let msg = isSuspicious
            ? "Hmm... something about that sounded suspicious. I’d be cautious."
            : "That sounded natural to me. Nothing concerning.";

        output.innerText += "\nAI: " + msg;
        speak(msg);
    }, 2000);
}

// 🔊 Voice Output
function speak(text) {
    let speech = new SpeechSynthesisUtterance(text);

    speech.lang = "en-US";
    speech.rate = 0.85;
    speech.pitch = 1;

    let voices = window.speechSynthesis.getVoices();

    let preferred = voices.find(v =>
        v.name.includes("Google") || v.name.includes("Female")
    );

    speech.voice = preferred || voices[0];

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(speech);
}

// 🎯 Mode switch
function setMode(mode) {
    currentMode = mode;

    document.getElementById("mode").innerText =
        "Mode: " + mode.toUpperCase();

    let levelControls = document.getElementById("levelControls");

    // 🎯 Show only in interview mode
    if (mode === "interview") {
        levelControls.style.display = "block";
    } else {
        levelControls.style.display = "none";
    }

    // 🎨 Change wave color
    if (mode === "interview") waveColor = "#ef4444";   // red
    else if (mode === "security") waveColor = "#facc15"; // yellow
    else waveColor = "#22c55e"; // green
}

// 🎯 Interview level
function setLevel(level) {
    interviewLevel = level;

    document.getElementById("mode").innerText =
        "Mode: INTERVIEW (" + level.toUpperCase() + ")";
}