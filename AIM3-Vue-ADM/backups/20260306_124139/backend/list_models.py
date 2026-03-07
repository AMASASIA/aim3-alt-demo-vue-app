import google.generativeai as genai
import os

genai.configure(api_key="AIzaSyCiLO-pbMChwMe3vIYyA7ZYrFPolOHNWWw")
try:
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(m.name)
except Exception as e:
    print(f"Error: {e}")
