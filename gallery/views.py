from urllib import request

from django.shortcuts import render, redirect
from django.http import HttpResponse
from .models import Asset
from .forms import AssetForm
from django.contrib import messages
import base64
from django.core.files.base import ContentFile

from django.shortcuts import render, redirect
from django.db.models import Q # Импортируем Q-object для сложного поиска
from .models import Asset
from .forms import AssetForm

from django.utils import timezone
from datetime import timedelta

from django.core.paginator import Paginator

def about(request):
    #return HttpResponse("<h2>Курс Web Структуры.</h2>")
    return render(request, 'gallery/about.html')

def home(request):
    # 1. Получаем параметры из URL (GET-запроса)
    # Если параметра нет, вернет None (или пустую строку, если мы так настроили)
    search_query = request.GET.get('q', '')
    ordering = request.GET.get('ordering', 'new') # По умолчанию 'new'
    # 2. Базовый запрос: Берем ВСЕ
    assets = Asset.objects.all()
    # 3. Применяем поиск (если пользователь что-то ввел)
    if search_query:
        # icontains = Case Insensitive Contains (содержит, без учета регистра)
        # Если бы у нас было поле 'description', мы бы использовали Q:
        # assets = assets.filter(Q(title__icontains=search_query) | Q(description__icontains=search_query))
        assets = assets.filter(title__icontains=search_query)
    now = timezone.localtime(timezone.now())
    if ordering == 'today only':
        start_of_day = now.replace(hour=0, minute=0, second=0, microsecond=0)
        assets = assets.filter(created_at__gte=start_of_day).order_by('-created_at')
        
    elif ordering == 'week only':
        last_week = now - timedelta(days=7)
        assets = assets.filter(created_at__gte=last_week).order_by('-created_at')

    # 4. Применяем сортировку
    if ordering == 'old':
        assets = assets.order_by('created_at') # От старых к новым
    elif ordering == 'name':
        assets = assets.order_by('title')      # По алфавиту
    else:
        # По умолчанию (new) - свежие сверху
        assets = assets.order_by('-created_at')
    # 5. Отдаем результат
    paginator = Paginator(assets, 9) 
    # Получаем номер страницы из URL (например, ?page=2)
    page_number = request.GET.get('page')
    # Получаем конкретный кусочек данных (объект Page)
    page_obj = paginator.get_page(page_number)
    context_data = {
        'page_title': 'Главная Галерея',
        # 'assets': assets,  <-- ЭТУ СТРОКУ УДАЛИТЬ!
        'page_obj': page_obj, # <-- ВМЕСТО НЕЁ ЭТУ
    }
    return render(request, 'gallery/index.html', context_data)

def upload(request):
    if request.method == 'POST':
        # ... validation ...
        if form.is_valid():
            # ... save logic ...
            new_asset.save()
            
            # ДОБАВЛЯЕМ СООБЩЕНИЕ
            messages.success(request, f'Модель "{new_asset.title}" успешно загружена!')
            
            return redirect('home')