from flask import Flask, render_template, request, jsonify
import os

app = Flask(__name__)

questions = [
    "Tell me about yourself.",
    "What are your strengths?",
    "Why should we hire you?"
]

current_q = 0

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/process", methods=["POST"])
def process():
    global current_q
    data = request.json
    user_text = data.get("text", "").lower()

    response = ""

    if "start interview" in user_text:
        current_q = 0
        response = questions[current_q]

    elif current_q < len(questions):
        # Improved Emotion Detection
        low_conf_words = ["umm", "maybe", "i think", "not sure"]
        high_conf_words = ["definitely", "confident", "strong", "clearly"]

        if any(word in user_text for word in low_conf_words):
            feedback = "You sound a bit unsure. Try speaking with more confidence."
        elif any(word in user_text for word in high_conf_words):
            feedback = "Great confidence! That was a strong answer."
        elif len(user_text.split()) < 5:
            feedback = "Your answer is too short. Try to elaborate more."
        else:
            feedback = "Good answer. Clear and structured."

        current_q += 1

        if current_q < len(questions):
            response = f"{feedback} Next question: {questions[current_q]}"
        else:
            response = f"{feedback} Interview completed!"

    elif "check voice" in user_text:
        response = "⚠️ Warning. This voice may be AI-generated."

    else:
        response = "I'm here to assist you. Say 'start interview' to begin."

    return jsonify({"response": response})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)