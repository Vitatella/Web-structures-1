from django.shortcuts import render
from django.http import HttpResponse

#def home(request):
    # Мы пока не используем HTML-шаблоны, просто вернем строку.
    #return HttpResponse("<h1>Добро пожаловать в 3D Хранилище</h1><p>Система работает.</p>")

def about(request):
    return HttpResponse("<h2>Курс Web Структуры.</h2>")

def home(request):
    # Имитация данных из базы (список словарей)
    fake_database = [
        {'id': 1, 'name': 'Sci-Fi Helmet', 'file_size': '15 MB'},
        {'id': 2, 'name': 'Old Chair', 'file_size': '2 MB'},
        {'id': 3, 'name': 'Cyber Truck', 'file_size': '10 MB'},
        {'id': 4, 'name': 'EWiobjboeihgwerh]', 'file_size': '1024 GB'},
    ]
    context_data = {
        'page_title': 'Главная Галерея',
        'assets': fake_database, # Передаем весь список
    }
    return render(request, 'gallery/index.html', context_data)