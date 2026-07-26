from flask import Flask, render_template
from datetime import datetime
import pytz
import os import abort
app = Flask(__name__)

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/allotment")
def allotment():
    return render_template("allotment.html")

@app.route("/contact")
def contact():
    return render_template("contact.html")

@app.route("/blog")
def blog():
    return render_template("blog.html")

@app.route("/terms")
def terms():
    return render_template("terms.html")

@app.route("/ipo-calendar")
def ipo_calendar():

    india = pytz.timezone("Asia/Kolkata")
    now = datetime.now(india)

    # Show only after 6 AM
    show_calendar = now.hour >= 6

    calendar_folder = os.path.join(app.static_folder, "calendar")

    latest_image = None

    if os.path.exists(calendar_folder):

        images = []

        for file in os.listdir(calendar_folder):

            if file.lower().endswith((".jpg", ".jpeg", ".png", ".webp")):

                full_path = os.path.join(calendar_folder, file)

                images.append(
                    (
                        file,
                        os.path.getmtime(full_path)
                    )
                )

        if images:
            latest_image = max(images, key=lambda x: x[1])[0]

    return render_template(
        "ipo-calendar.html",
        show_calendar=show_calendar,
        latest_image=latest_image,
        current_time=now.strftime("%d %B %Y %I:%M %p")
    )

if __name__ == "__main__":
    app.run()
