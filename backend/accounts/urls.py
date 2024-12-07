from django.urls import path
from . import views
from .views import login

urlpatterns = [
    path('signup/', views.signup, name='signup'),
    path('send-2fa/', views.send_otp, name='send-otp'),
    path('login/', login, name='login'),
]
