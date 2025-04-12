from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

# Mock database (In production, use a real database)
users = {
    'students': {
        'student1': {
            'password': 'pass123',
            'name': 'John Doe',
            'grade': '10',
            'records': {
                'Mathematics': {'mid_term': 92, 'final': 95, 'grade': 'A+'},
                'Science': {'mid_term': 88, 'final': 90, 'grade': 'A'},
                'English': {'mid_term': 85, 'final': 87, 'grade': 'B+'}
            }
        }
    },
    'teachers': {
        'teacher1': {
            'password': 'pass123',
            'name': 'Mrs. Smith',
            'subjects': ['Mathematics'],
            'classes': ['10-A', '10-B']
        }
    }
}

# Serve static files
@app.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('.', path)

# Authentication endpoints
@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    user_type = data.get('user_type')

    if user_type == 'student':
        user = users['students'].get(username)
    else:
        user = users['teachers'].get(username)

    if user and user['password'] == password:
        return jsonify({
            'success': True,
            'user': {
                'name': user['name'],
                'type': user_type
            }
        })
    
    return jsonify({
        'success': False,
        'message': 'Invalid credentials'
    }), 401

# Student endpoints
@app.route('/api/student/records/<username>')
def get_student_records(username):
    student = users['students'].get(username)
    if student:
        return jsonify({
            'success': True,
            'records': student['records']
        })
    return jsonify({
        'success': False,
        'message': 'Student not found'
    }), 404

# Teacher endpoints
@app.route('/api/teacher/classes/<username>')
def get_teacher_classes(username):
    teacher = users['teachers'].get(username)
    if teacher:
        return jsonify({
            'success': True,
            'classes': teacher['classes']
        })
    return jsonify({
        'success': False,
        'message': 'Teacher not found'
    }), 404

# Video call endpoints
@app.route('/api/create-meeting', methods=['POST'])
def create_meeting():
    data = request.json
    class_id = data.get('class_id')
    teacher_id = data.get('teacher_id')
    
    # In a real application, you would:
    # 1. Generate a unique meeting ID
    # 2. Store meeting details in database
    # 3. Handle meeting authentication
    
    return jsonify({
        'success': True,
        'meeting_id': f'SPSmartSchool_{class_id}_{teacher_id}',
        'jitsi_domain': 'meet.jit.si'
    })

if __name__ == '__main__':
    app.run(debug=True, port=8000)
