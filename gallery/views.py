from django.shortcuts import render, redirect
from django.http import HttpResponse
from .models import Asset
from .forms import AssetForm
from django.contrib import messages

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

def upload(request):
    if request.method == 'POST':
        # Сценарий: Пользователь нажал "Отправить"
        # ВАЖНО: Передаем request.FILES, иначе файл потеряется!
        form = AssetForm(request.POST, request.FILES)
        if form.is_valid():
            # Если все поля заполнены верно - сохраняем в БД
            form.save()
            # И перекидываем пользователя на главную
            messages.success(request, 'Спасибо, файл загружен!')
            return redirect('home')
        else:
            messages.warning(request, "Неправильный формат файла")
    else:
        # Сценарий: Пользователь просто зашел на страницу (GET)
        form = AssetForm() # Создаем пустую форму
        # Отдаем шаблон, передавая туда форму (заполненную ошибками или пустую)
    return render(request, 'gallery/upload.html', {'form': form})