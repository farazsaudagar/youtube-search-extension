from flask import Flask, request, jsonify
from youtube_transcript_api import YouTubeTranscriptApi
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)

# DeepSeek API configuration
DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions"

@app.route('/api/transcript', methods=['GET'])
def get_transcript():
    video_id = request.args.get('video_id')
    if not video_id:
        return jsonify({'error': 'Video ID is required'}), 400

    try:
        # Try to get English transcript first
        transcript = YouTubeTranscriptApi.get_transcript(video_id, languages=['en'])
        
        # Format the transcript data
        formatted_transcript = [
            {
                'text': item['text'],
                'timestamp': f"{int(item['start'] // 60):02d}:{int(item['start'] % 60):02d}",
                'start': item['start'],
                'end': item['start'] + item['duration']
            }
            for item in transcript
        ]
        
        return jsonify({'transcript': formatted_transcript})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/ai-search', methods=['POST'])
def ai_search():
    try:
        data = request.json
        query = data.get('query')
        transcript = data.get('transcript')
        api_key = data.get('api_key')
        
        if not query or not transcript:
            return jsonify({'error': 'Query and transcript are required'}), 400
            
        if not api_key:
            return jsonify({'error': 'DeepSeek API key is required'}), 400

        # Prepare the transcript for context
        context = "\n".join([f"[{item['timestamp']}] {item['text']}" for item in transcript])
        
        # Create the prompt for DeepSeek
        prompt = f"""Given the following video transcript with timestamps, answer the question: {query}

Transcript:
{context}

Please provide a detailed answer with specific timestamps as references. Format your response as:
1. A clear answer to the question
2. Relevant timestamps and quotes from the transcript that support your answer
3. Any additional context or insights

Answer:"""

        # Get AI response from DeepSeek
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": "deepseek-chat",
            "messages": [
                {"role": "system", "content": "You are a helpful assistant that answers questions about video content using the provided transcript."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.7,
            "max_tokens": 500
        }

        response = requests.post(DEEPSEEK_API_URL, headers=headers, json=payload)
        response.raise_for_status()
        ai_response = response.json()

        return jsonify({
            'answer': ai_response['choices'][0]['message']['content'],
            'timestamps': extract_timestamps(ai_response['choices'][0]['message']['content'])
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

def extract_timestamps(text):
    # Extract timestamps from the AI response
    import re
    timestamp_pattern = r'(\d{2}:\d{2})'
    return list(set(re.findall(timestamp_pattern, text)))

if __name__ == '__main__':
    app.run(debug=True) 