import random

def get_fallback_questions(skills):
    questions = []
    for i in range(1, 31):
        skill = skills[i % len(skills)] if skills else "General Software Engineering"

        # Providing varied generic questions for the fallback
        if i % 3 == 0:
            q_text = f"Which of the following describes a best practice in {skill}?"
            opts = ["Writing single God objects", "Extensive manual deployment processes", "Modularity and Separation of Concerns", "Ignoring edge cases"]
            ans = "Modularity and Separation of Concerns"
        elif i % 3 == 1:
            q_text = f"What is the primary advantage of mastering {skill}?"
            opts = ["Increased build times", "Better system maintainability and performance", "Lower code readability", "Reduced team velocity"]
            ans = "Better system maintainability and performance"
        else:
            q_text = f"In the context of {skill}, what does DRY stand for?"
            opts = ["Don't Repeat Yourself", "Do Repeat Yourself", "Deploy Right Yearly", "Data Redundancy Yield"]
            ans = "Don't Repeat Yourself"

        # Shuffle options
        shuffled_opts = list(opts)
        random.shuffle(shuffled_opts)

        questions.append({
            "id": i,
            "question": q_text,
            "options": shuffled_opts,
            "correctAnswer": ans
        })
    return questions
