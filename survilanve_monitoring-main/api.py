from flask import Flask, request, jsonify
from flask_cors import CORS
import pymysql
import os
from dotenv import load_dotenv
import boto3 as bt
import base64
import tempfile


load_dotenv()
bucket_name = os.getenv("S3_BUCKET_NAME")
s3 = bt.client("s3")

app = Flask(__name__)
CORS(app)  # Enable CORS for all domains

def data_init():
    RDS_HOST = os.getenv("RDS_HOST")
    RDS_USER = os.getenv("RDS_USER")
    RDS_PASSWORD = os.getenv("RDS_PASSWORD")

    # Connect without selecting a database
    conn = pymysql.connect(
        host=RDS_HOST,
        user=RDS_USER,
        password=RDS_PASSWORD
    )
    return conn

def insert_student(conn, student_data):
    with conn.cursor() as cursor:
        sql = """
            INSERT INTO students (college_mail, roll_no, reg_no, student_name, phone_number, dept_section, pep_hope, year, password)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        cursor.execute(sql, (
            student_data['college_mail'],
            student_data['roll_no'],
            student_data['reg_no'],
            student_data['student_name'],
            student_data['phone_number'],
            student_data['dept_section'],
            student_data['pep_hope'],
            student_data['year'],
            student_data['password']
        ))
        conn.commit()
def update_s3_path(conn, roll_no, s3_path):
    with conn.cursor() as cursor:
        sql = "UPDATE students SET S3_string = %s WHERE roll_no = %s"
        cursor.execute(sql, (s3_path, roll_no))
        conn.commit()

def save_base64_image(base64_string, file_path):
    try:
        # Remove the data:image/png;base64, prefix if present
        if ',' in base64_string:
            base64_string = base64_string.split(',')[1]
        # Decode and save
        with open(file_path, 'wb') as f:
            f.write(base64.b64decode(base64_string))
        return True
    except Exception as e:
        print(f"Error saving image: {str(e)}")
        return False

def upload_to_s3(user_id, images):
    temp_files = []
    try:
        # Create temporary directory
        with tempfile.TemporaryDirectory() as temp_dir:
            # Save base64 images to temporary files
            for i, img_data in enumerate(images, start=1):
                temp_path = os.path.join(temp_dir, f'img{i}.jpg')
                if save_base64_image(img_data, temp_path):
                    temp_files.append(temp_path)
                else:
                    raise Exception(f"Failed to save image {i}")

            # Upload to S3
            folder_prefix = f"{user_id}/"
            s3.put_object(Bucket=bucket_name, Key=folder_prefix)
            
            for i, img_path in enumerate(temp_files, start=1):
                file_key = f"{folder_prefix}img{i}.jpg"
                s3.upload_file(img_path, bucket_name, file_key)
                print(f"Uploaded {img_path} to s3://{bucket_name}/{file_key}")

        return f"s3://{bucket_name}/{folder_prefix}"
    
    except Exception as e:
        print(f"Error in upload_to_s3: {str(e)}")
        raise

@app.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        # Extract user data
        student_data = {
            'college_mail': data.get('collegeMail'),
            'roll_no': data.get('rollNo'),
            'reg_no': data.get('regNo'),
            'student_name': data.get('studentName'),
            'phone_number': data.get('phoneNumber'),
            'dept_section': data.get('deptSection'),
            'pep_hope': data.get('pepHope'),
            'year': data.get('year'),
            'password': data.get('password')
        }
        
        # Insert student data first
        insert_student(conn, student_data)
        
        # Handle image upload
        images = [
            data.get('photoFront'),
            data.get('photoLeft'),
            data.get('photoRight')
        ]
        
        s3_path = upload_to_s3(student_data['roll_no'], images)
        update_s3_path(conn, student_data['roll_no'], s3_path)
        
        return jsonify({
            'status': 'success',
            'message': 'Registration successful',
            's3_path': s3_path
        })
        
    except Exception as e:
        print(f"Error in register: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

if __name__ == '__main__':
    conn = data_init()
    db_name = "formdb"
    conn.select_db(db_name)
    app.run(host="0.0.0.0",port=5600,debug=True)
