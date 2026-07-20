from flask import Flask, render_template
from routes.allotment import allotment_bp

app = Flask(__name__)
app.register_blueprint(allotment_bp)

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

if __name__ == "__main__":
    app.run()
