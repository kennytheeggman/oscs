from flask import Flask

app = Flask("main")

@app.route("/")
def hello():
    return "<h1>Hello, World</h1>"

if __name__ == "__main__":
    
    print("Hello, World")
    app.run(host="0.0.0.0", port=5000)

