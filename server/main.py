from flask import Flask, request, jsonify
import threading
import time
import uuid
import os
from werkzeug.utils import secure_filename

from utils import timer
from transcription import transcribe
from reason import reason

app = Flask(__name__)
# This is the path to the upload directory
app.config['UPLOAD_FOLDER'] = 'uploads/'
# These are the extension that we are accepting to be uploaded
app.config['ALLOWED_EXTENSIONS'] = {'wav'}

# A dictionary to hold the results with a unique task ID
results = {}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1] in app.config['ALLOWED_EXTENSIONS']


@timer
def process_file(task_id, filepath):
    transcription = transcribe(filepath)
    # Store the results (in this example, we're just storing a simple message)
    print(transcription["text"])
    results[task_id] = reason(transcription["text"])

@app.route('/upload', methods=['POST'])
def upload_file():
    audio = request.files.get('audio')

    if audio and allowed_file(audio.filename):
        # Save file
        filename = secure_filename(audio.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        audio.save(filepath)
        # Generate a task ID
        task_id = str(uuid.uuid4())

        
        # Start a new thread to process the file
        threading.Thread(target=process_file, args=(task_id, filepath,)).start()

        return jsonify({"message": "File is being processed.", "task_id": task_id}), 202
    return jsonify({"message": "File is not a valid file"}), 500

@app.route('/get_result/<task_id>', methods=['GET'])
def get_result(task_id):
    result = results.get(task_id)
    if not result:
        return jsonify({"error": "Task not found or processing not complete"}), 503
    return jsonify({"result": result}), 200

if __name__ == '__main__':
    app.run(debug=True, port=3000)
