from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import current_user
from flask_restful import Api, Resource
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os


app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///blog.db'
app.config['SECRET_KEY'] = 'your_secret_key_here'
CORS(app)  # This will enable CORS for all routes

db = SQLAlchemy(app)
login_manager = LoginManager(app)

UPLOAD_FOLDER = '/home/alpha/Documents/projects/blog/images'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER


def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(100), nullable=False)

class Comment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text)
    post_id = db.Column(db.Integer, db.ForeignKey('blog_post.id'))

# Function to add a comment to a blog post
@app.route('/blog-posts/<int:post_id>/comments', methods=['POST'])
def add_comment(post_id):
    data = request.json
    content = data.get('content')

    if not content:
        return {'error': 'Content is required'}, 400

    comment = Comment(content=content, post_id=post_id)
    db.session.add(comment)
    db.session.commit()

    return {'message': 'Comment added successfully'}, 201

# Function to retrieve comments for a blog post
@app.route('/blog-posts/<int:post_id>/comments', methods=['GET'])
def get_comments(post_id):
    comments = Comment.query.filter_by(post_id=post_id).all()
    return jsonify([{'id': comment.id, 'content': comment.content} for comment in comments])

class BlogPost(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    content = db.Column(db.Text, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    user = db.relationship('User', backref=db.backref('blog_posts', lazy=True))
    image_url = db.Column(db.String(200))  # Define image_url field




@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@app.route('/check-authentication')
def check_authentication():
    if current_user.is_authenticated:
        return jsonify({'authenticated': True})
    else:
        return jsonify({'authenticated': False})


@app.route('/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not username or not email or not password:
        return jsonify({'error': 'Missing username, email, or password'}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({'error': 'Username already exists'}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already exists'}), 400

    user = User(username=username, email=email, password_hash=generate_password_hash(password))
    db.session.add(user)
    db.session.commit()

    return jsonify({'message': 'User registered successfully'}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'error': 'Missing username or password'}), 400

    user = User.query.filter_by(username=username).first()

    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({'error': 'Invalid username or password'}), 401

    login_user(user)
    return jsonify({'message': 'Logged in successfully'}), 200

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return jsonify({'message': 'Logged out successfully'}), 200

# CRUD operations for Blog Posts

@app.route('/blog-posts', methods=['GET'])
def get_blog_posts():
    blog_posts = BlogPost.query.all()
    return jsonify([{"id": post.id, "title": post.title, "content": post.content, "user_id": post.user_id,         "image_url": post.image_url} for post in blog_posts])

@app.route('/blog-posts/<int:post_id>', methods=['GET'])
def get_blog_post(post_id):
    post = BlogPost.query.get_or_404(post_id)
    return jsonify({"id": post.id, "title": post.title, "content": post.content, "user_id": post.user_id})

@app.route('/blog-posts', methods=['POST'])
@login_required
def create_blog_post():
    data = request.json
    title = data.get('title')
    content = data.get('content')

    if not title or not content:
        return jsonify({'error': 'Missing title or content'}), 400

    post = BlogPost(title=title, content=content, user_id=current_user.id)
    db.session.add(post)
    db.session.commit()

    return jsonify({'message': 'Blog post created successfully'}), 201

@app.route('/user/posts/<int:user_id>', methods=['GET'])
@login_required
def get_user_posts(user_id):
    # Here you should implement logic to fetch user's posts based on their authentication
    # For now, let's assume all posts belong to the same user
    posts = BlogPost.query.filter_by(user_id=user_id).all()
    if not posts:
        return jsonify({'error': 'No posts found for the user'}), 404
    # Serialize posts
    serialized_posts = [{'id': post.id, 'title': post.title, 'content': post.content} for post in posts]
    return jsonify(serialized_posts)

@app.route('/blog-posts/<int:post_id>', methods=['PUT'])
@login_required
def update_blog_post(post_id):
    post = BlogPost.query.get_or_404(post_id)
    data = request.json
    title = data.get('title')
    content = data.get('content')

    if not title or not content:
        return jsonify({'error': 'Missing title or content'}), 400

    post.title = title
    post.content = content
    db.session.commit()

    return jsonify({'message': 'Blog post updated successfully'}), 200

@app.route('/blog-posts/<int:post_id>', methods=['DELETE'])
@login_required
def delete_blog_post(post_id):
    post = BlogPost.query.get_or_404(post_id)
    db.session.delete(post)
    db.session.commit()
    return jsonify({'message': 'Blog post deleted successfully'}), 200

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
