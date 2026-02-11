from django.shortcuts import render
from django.http import HttpResponse
from .models import Asset

#def home(request):
    # Мы пока не используем HTML-шаблоны, просто вернем строку.
    #return HttpResponse("<h1>Добро пожаловать в 3D Хранилище</h1><p>Система работает.</p>")

def about(request):
    #return HttpResponse("<h2>Курс Web Структуры.</h2>")
    return render(request, 'gallery/about.html')

def home(request):
    # ORM Запрос: "Дай мне все объекты Asset из базы"
    assets = Asset.objects.all().order_by('-created_at')
    context_data = {
    'page_title': 'Главная Галерея',
    'assets': assets
    }
    return render(request, 'gallery/index.html', context_data)

def upload (request):
    return render(request, 'gallery/upload.html')