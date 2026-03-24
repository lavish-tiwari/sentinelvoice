function startListening() {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = "en-US";

    recognition.onresult = function(event) {
        let text = event.results[0][0].transcript;
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
    let msg = "⚠️ Warning: This voice appears AI-generated.";
    document.getElementById("output").innerText = "AI: " + msg;
    document.getElementById("mode").innerText = "Mode: Security 🛡️";
    speak(msg);
}

// 🔊 Voice Output
function speak(text) {
    let speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-US";
    window.speechSynthesis.speak(speech);
}