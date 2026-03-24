from flask import Flask, render_template, request, jsonify
import os

app = Flask(__name__)

questions = [
    "Tell me about yourself.",
    "What are your strengths?",
    "Why should we hire you?"
]

score = 0
total_questions = len(questions)
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
        global score

        low_conf_words = ["umm", "maybe", "i think", "not sure"]
        high_conf_words = ["definitely", "confident", "strong", "clearly"]

        if any(word in user_text for word in low_conf_words):
            feedback = "You sound unsure. Try to be more confident."
            score += 1
        elif any(word in user_text for word in high_conf_words):
            feedback = "Great confidence! That was a strong answer."
            score += 3
        elif len(user_text.split()) < 5:
            feedback = "Your answer is too short. Try to elaborate more."
            score += 1
        else:
            feedback = "Good answer. Clear and structured."
            score += 2

        current_q += 1

        if current_q < len(questions):
            response = f"{feedback} Next question: {questions[current_q]}"
        else:
            final_score = round((score / (total_questions * 3)) * 10, 1)

            if final_score >= 8:
                summary = "Excellent performance! You're interview ready."
            elif final_score >= 5:
                summary = "Good attempt, but needs improvement."
            else:
                summary = "You need more practice. Focus on confidence and clarity."

            response = f"{feedback} Interview completed! Your score is {final_score}/10. {summary}"

            score = 0  # reset for next interview
            
    elif "check voice" in user_text:
        response = "⚠️ Warning. This voice may be AI-generated."

    else:
        response = "I'm here to assist you. Say 'start interview' to begin."

    return jsonify({"response": response})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)