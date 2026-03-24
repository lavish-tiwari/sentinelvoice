let lastUserSpeech = "";
let currentMode = "assistant";
function startListening() {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = "en-US";

    recognition.onresult = function(event) {
        let text = event.results[0][0].transcript;
        lastUserSpeech = text;
        document.getElementById("output").innerText = "You: " + text;

        fetch("/process", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
            text: text,
            mode: currentMode
        })
        })
        .then(res => res.json())
        .then(data => {
            let reply = data.response;

            document.getElementById("output").innerText += "\nAI: " + reply;

            // 🔥 Mode detection
            if (text.toLowerCase().includes("start interview")) {
                document.getElementById("mode").innerText = "Mode: Interview 🎯";
            } else if (text.toLowerCase().includes("check voice")) {
                document.getElementById("mode").innerText = "Mode: Security 🛡️";
            } else {
                document.getElementById("mode").innerText = "Mode: Assistant 🤖";
            }

            speak(reply);
        });
    };

    recognition.start();
}

// 🛡️ Scam Demo Button
function fakeScam() {
    let output = document.getElementById("output");
    document.getElementById("mode").innerText = "Mode: Security 🛡️";

    if (!lastUserSpeech) {
        output.innerText = "AI: No voice input detected. Please speak first.";
        speak("No voice input detected. Please speak first.");
        return;
    }

    // Step 1: analyzing
    output.innerText = "AI: Let me think for a second...";
    speak("Analyzing your last voice input...");

    setTimeout(() => {
        // 🔥 simple logic to simulate detection
        let suspiciousWords = ["urgent", "transfer", "send money", "otp"];

        let isSuspicious = suspiciousWords.some(word =>
            lastUserSpeech.toLowerCase().includes(word)
        );

        let msg;

        if (isSuspicious) {
            msg = "Hmm... something about that sounded a bit suspicious. I’d recommend being cautious.";
        } else {
            msg = "That sounded natural to me. I don’t detect anything concerning.";
        }

        output.innerText += "\nAI: " + msg;
        speak(msg);

    }, 2000);
}

// 🔊 Voice Output
function speak(text) {
    let speech = new SpeechSynthesisUtterance(text);

    speech.lang = "en-US";

    speech.rate = 0.85;   // slower = more human
    speech.pitch = 1;
    speech.volume = 1;

    let voices = window.speechSynthesis.getVoices();

function setMode(mode) {
    currentMode = mode;

    document.getElementById("mode").innerText =
        "Mode: " + mode.toUpperCase();
}
    // Try more natural voices
    let preferred = voices.find(v => 
        v.name.includes("Google US English") ||
        v.name.includes("Female")
    );

    speech.voice = preferred || voices[0];

    window.speechSynthesis.cancel(); // stop overlap
    window.speechSynthesis.speak(speech);
}