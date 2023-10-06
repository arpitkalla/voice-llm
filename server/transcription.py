from pydub import AudioSegment
from utils import timer
import whisper

model = whisper.load_model("base")

def load_last_N_seconds(audio_path, N):
    # Load audio file
    audio = AudioSegment.from_file(audio_path)
    min_window_ms = min(N * 1000, len(audio))
    segment = audio[-min_window_ms:]

    # Export to a new file (temporary, for this example)
    temp_path = "uploads/temp.wav"
    segment.export(temp_path, format="wav")
    
    return temp_path
@timer
def transcribe(audio_path):
    segment_path = load_last_N_seconds(audio_path, 30)
    return model.transcribe(segment_path)