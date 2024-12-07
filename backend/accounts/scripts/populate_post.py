import os
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')  # Replace 'backend' with your project name
django.setup()

from accounts.models import Post

# Posts data
posts = [
    {
        "id": 1,
        "user": {
            "name": "Isaac Martinez",
            "avatar": "https://via.placeholder.com/40",
        },
        "time": "7m",
        "group": "ChatGPT",
        "title": "ChatGPT's Faux Empathy",
        "content": "Anyone else annoyed by ChatGPT's pretend empathy and its imitation of Carl Rogers' style? It's like it's trying too hard to sound human.",
        "image": "https://via.placeholder.com/300",  # Replace with placeholderImage1 URL
        "likes": 1,
        "comments": 0,
    },
    {
        "id": 2,
        "user": {
            "name": "Robert Murphy",
            "avatar": "https://via.placeholder.com/40",
        },
        "time": "32m",
        "group": "AI Research",
        "title": "Getting Started with Research in AI",
        "content": "I'm a sophomore in CS and I'm curious about diving into research at UF, especially in AI, computer vision, and software engineering. I heard meeting with CURBS peer advisors is a good starting point, so I'm planning to do that.",
        "image": None,
        "likes": 5,
        "comments": 0,
    },
    {
        "id": 3,
        "user": {
            "name": "Sophia Turner",
            "avatar": "https://via.placeholder.com/40",
        },
        "time": "15m",
        "group": "AI Coaches",
        "title": "Understanding AI Coaching",
        "content": "AI coaching can be a powerful tool for personal and professional growth. Has anyone tried using an AI for personal development?",
        "image": "https://via.placeholder.com/300",  # Replace with placeholderImage2 URL
        "likes": 3,
        "comments": 5,
    },
    # Add more posts as needed
]

# Populate the database
for post_data in posts:
    Post.objects.create(
        username=post_data["user"]["name"],
        title=post_data["title"],
        post=post_data["content"],
        no_of_likes=post_data["likes"],
        no_of_comments=post_data["comments"],
        community=post_data["group"],
    )

print("Posts have been successfully added to the database!")