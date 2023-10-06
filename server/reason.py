import openai
from utils import timer
openai.api_key = "sk-<SECRET-KEY>"

context_prompt = """
You are an AI Voice asssitant which can only read in the last 30 seconds of the transcription
and has to reason what the user might want as the output. The responses should be very succinct
as they will be spoken back, so ideally a few words.\n
"""

question_prompt_builder = """
Transcription: {}
"""
@timer
def reason(transcription):
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        temperature=0,
        messages=[
            {
                "role": "assistant",
                "content": context_prompt + question_prompt_builder.format(transcription)
            }
        ]
    )
    print(response)
    return response.choices[0].message.content