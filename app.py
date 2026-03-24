from urllib import response

from flask import Flask, render_template, request, jsonify
import os
import requests

app = Flask(__name__)

beginner_questions = [
    "Tell me about yourself.",
    "What are your strengths?",
    "Why should we hire you?"
]

advanced_questions = [
    "Explain a challenging project you worked on and how you handled it.",
    "Describe a situation where you failed and what you learned.",
    "How do you handle pressure and tight deadlines?"
]

score = 0
total_questions = len(beginner_questions)  # Initialize with beginner questions count
current_q = 0
interview_active = False
mode = "assistant"
interview_level = "beginner"

def generate_murf_audio(text):
    url = "https://api.murf.ai/v1/speech/generate"

    headers = {
        "api-key": "ap2_e4ec565b-4562-4502-b1d2-5f28e0da451c",
        "Content-Type": "application/json"
    }

    payload = {
        "voiceId": "en-US-natalie",  # you can change voice
        "text": text
    }

    response = requests.post(url, json=payload, headers=headers)

    if response.status_code == 200:
        return response.json().get("audioFile")
    else:
        return None

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/process", methods=["POST"])
def process():
    global current_q, score, interview_active, mode, interview_level 

    data = request.json
    user_text = data.get("text", "").lower()

    mode = data.get("mode", "assistant")
    interview_level = data.get("level", "beginner")

    response = ""

    if mode == "assistant":

        if "how" in user_text or "use" in user_text:
            response = "You can switch between modes using the buttons. Try Interview mode to practice or Security mode to analyze voice input."

        elif "interview" in user_text:
            response = "Interview mode lets you practice real questions. You can choose beginner or advanced level."

        elif "security" in user_text:
            response = "Security mode analyzes your speech for potentially suspicious or unsafe content."

        else:
            response = "I can guide you through interview practice, voice analysis, or general assistance. What would you like to try?"

    elif mode == "interview":

        questions = beginner_questions if interview_level == "beginner" else advanced_questions

        if not interview_active:
            current_q = 0
            score = 0
            interview_active = True
            response = questions[current_q]

        elif current_q < len(questions):

            low_conf_words = ["umm", "maybe", "i think", "not sure"]
            high_conf_words = ["definitely", "confident", "strong", "clearly"]

            if any(word in user_text for word in low_conf_words):
                feedback = "You seem a little unsure there... maybe try expressing it with more confidence."
                score += 1
            elif any(word in user_text for word in high_conf_words):
                feedback = "That was actually a strong answer. You sounded confident and clear."
                score += 3
            elif len(user_text.split()) < 5:
                feedback = "That felt a bit short... maybe expand a little more."
                score += 1
            else:
                feedback = "Good answer. Clear and structured."
                score += 2

            current_q += 1

            if current_q < len(questions):
                response = f"{feedback} Next question: {questions[current_q]}"
            else:
                final_score = round((score / (total_questions * 3)) * 10, 1)

                response = f"{feedback} Interview completed! Your score is {final_score}/10."

                interview_active = False
                score = 0

    elif mode == "security":
    
        suspicious_words = ["urgent", "transfer", "send money", "otp"]

        if any(word in user_text for word in suspicious_words):
            response = "Hmm... something about that sounded a bit suspicious. I’d recommend being cautious."
        else:
            response = "That sounded natural to me. I don’t detect anything concerning."

    audio_url = generate_murf_audio(response)

    return jsonify({
        "response": response,
        "audio": audio_url
    })


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)