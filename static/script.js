let lastUserSpeech = "";
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
            body: JSON.stringify({ text: text })
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
    output.innerText = "AI: Analyzing your last voice input...";
    speak("Analyzing your last voice input...");

    setTimeout(() => {
        // 🔥 simple logic to simulate detection
        let suspiciousWords = ["urgent", "transfer", "send money", "otp"];

        let isSuspicious = suspiciousWords.some(word =>
            lastUserSpeech.toLowerCase().includes(word)
        );

        let msg;

        if (isSuspicious) {
            msg = "⚠️ Warning: This voice content seems suspicious and potentially fraudulent.";
        } else {
            msg = "✅ This voice appears safe and natural.";
        }

        output.innerText += "\nAI: " + msg;
        speak(msg);

    }, 2000);
}

// 🔊 Voice Output
function speak(text) {
    let speech = new SpeechSynthesisUtterance(text);

    speech.lang = "en-US";

    // 🔥 Voice tuning
    speech.rate = 0.9;     // slower = more natural
    speech.pitch = 1;      // normal pitch
    speech.volume = 1;

    // Try different voices (Chrome only)
    let voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
        speech.voice = voices.find(v => v.name.includes("Google")) || voices[0];
    }

    window.speechSynthesis.speak(speech);
}