from flask import request
from flask_restful import Resource
from flask_login import current_user, login_required
from models import BlogPost, db

class BlogPostResource(Resource):
    @login_required
    def post(self):
        data = request.json
        title = data.get('title')
        content = data.get('content')
        author_id = current_user.id

        if not title or not content:
            return {'error': 'Title and content are required'}, 400

        post = BlogPost(title=title, content=content, author_id=author_id)
        db.session.add(post)
        db.session.commit()
        return {'message': 'Blog post created successfully'}, 201

    @login_required
    def put(self, post_id):
        post = BlogPost.query.get(post_id)

        if not post:
            return {'error': 'Blog post not found'}, 404

        if post.author_id != current_user.id:
            return {'error': 'You are not authorized to edit this post'}, 403

        data = request.json
        post.title = data.get('title', post.title)
        post.content = data.get('content', post.content)
        db.session.commit()
        return {'message': 'Blog post updated successfully'}, 200

    @login_required
    def delete(self, post_id):
        post = BlogPost.query.get(post_id)

        if not post:
            return {'error': 'Blog post not found'}, 404

        if post.author_id != current_user.id:
            return {'error': 'You are not authorized to delete this post'}, 403

        db.session.delete(post)
        db.session.commit()
        return {'message': 'Blog post deleted successfully'}, 200
