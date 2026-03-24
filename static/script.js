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

            speak(reply);
        });
    };

    recognition.start();
}

function speak(text) {
    let speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-US";
    window.speechSynthesis.speak(speech);
}
