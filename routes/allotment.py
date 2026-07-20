from flask import Blueprint, render_template

allotment_bp = Blueprint(
    "allotment",
    __name__
)

@allotment_bp.route("/allotment")
def allotment():

    return render_template("allotment.html")
