import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// 2. Экспортируем главную функцию
// Она принимает ID HTML-элемента, в который нужно вставить 3D
console.log("rthrthwer4hjw");
export function loadModel(containerId, modelUrl) {
    console.log("woeigwujtpje4wmpgwgge");
    const container = document.getElementById(containerId);
    //if (!container) return;
    // 1. Стандартная настройка сцены (как в прошлый раз)
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f5); // Цвет фона под карточку
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth /
        container.clientHeight, 0.1, 1000);
    //const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    //renderer.setSize(container.clientWidth, container.clientHeight);
    // Очищаем контейнер от текста "Wait..." и вставляем Canvas

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;



    container.appendChild(renderer.domElement);
    // --- ДОБАВЛЯЕМ УПРАВЛЕНИЕ ---
    const controls = new OrbitControls(camera, renderer.domElement);
    // Включаем инерцию (damping), чтобы вращение было плавным, как в Sketchfab
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    // Ограничиваем зум (чтобы не улететь сквозь модель)
    controls.minDistance = 0.1;
    controls.maxDistance = 120;


    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    // 2. Свет (ВАЖНО! Без него модель будет черной)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    const roomEnvironment = new RoomEnvironment();
    scene.environment = pmremGenerator.fromScene(roomEnvironment).texture;
    scene.background = null;


    if (!container) return;
    // ... (код сцены, камеры, рендерера, контролов, света) ...
    // Убедитесь, что очистка container.innerHTML = '' происходит ДО добавления лоадера

    // --- 1. Генерируем HTML лоадера программно --
    const loaderDiv = document.createElement('div');
    loaderDiv.className = 'loader-overlay';
    loaderDiv.innerHTML = `
        <div style="color: #666; font-size: 0.9rem;">Loading...</div>
        <div class="progress-bar">
            <div class="progress-fill"></div>
        </div>
    `;
    container.appendChild(loaderDiv);
    // Находим полоску, чтобы менять её ширину
    const progressFill = loaderDiv.querySelector('.progress-fill');



    // 3. Загрузка Модели
    const loader = new GLTFLoader();
    loader.load(
        modelUrl,

        // A. ON LOAD (Успех)
        (gltf) => {
            let loadedModel = null; // Создайте переменную
            loader.load(modelUrl, (gltf) => {
                loadedModel = gltf.scene; // Сохраняем ссылку
                fitCameraToObject(camera, loadedModel, 1.5);
                scene.add(loadedModel);
            });

            // Скрываем лоадер
            loaderDiv.style.opacity = '0';
            setTimeout(() => {
                loaderDiv.remove(); // Удаляем из DOM через 0.3 сек
            }, 300);
        },
         // B. ON PROGRESS (Прогресс)
        (xhr) => {
            // xhr.total - общий вес файла в байтах
            // xhr.loaded - сколько скачалось
            if (xhr.total > 0) {
                const percent = (xhr.loaded / xhr.total) * 100;
                progressFill.style.width = percent + '%';
            }
        },

        // C. ON ERROR (Ошибка)
        (error) => {
            console.error('Ошибка загрузки:', error);

            loaderDiv.innerHTML = `<div class="error-msg">
❌
 Ошибка загрузки<br>
<small>Проверьте файл</small></div>`;
        }
    );
    // ... (анимация и resize) ...






    // 4. Анимация (Loop)
    function animate() {
        requestAnimationFrame(animate);
        // ОБЯЗАТЕЛЬНО: Обновляем контроллер в каждом кадре
        controls.update();
        // Авто-вращение можно убрать или оставить по желанию.
        // Если оставить, оно будет конфликтовать с мышкой.
        // Давайте пока закомментируем авто-вращение:
        // if (loadedModel) loadedModel.rotation.y += 0.005;
        renderer.render(scene, camera);
    }

    animate();
    // Resize handler (как в прошлый раз)
    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
}

function fitCameraToObject(camera, object, offset = 1.25) {
    // 1. Вычисляем Bounding Box (коробку, в которую влезает модель)
    const boundingBox = new THREE.Box3();
    boundingBox.setFromObject(object);
    // 2. Находим центр этой коробки и её размер
    const center = boundingBox.getCenter(new THREE.Vector3());
    const size = boundingBox.getSize(new THREE.Vector3());
    // 3. Самая длинная сторона модели (чтобы точно влезла)
    const maxDim = Math.max(size.x, size.y, size.z);
    // 4. Смещаем саму модель так, чтобы её центр стал в 0,0,0
    // Вместо того чтобы двигать камеру за моделью, проще притянуть модель к центру мира
    object.position.x = -center.x;
    object.position.y = -center.y; // Теперь модель стоит на "полу" центра
    object.position.z = -center.z;
    // 5. Отодвигаем камеру назад
    // Немного тригонометрии: вычисляем дистанцию в зависимости от угла обзора (FOV)
    const fov = camera.fov * (Math.PI / 180);
    let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
    // Умножаем на коэффициент (offset), чтобы модель не упиралась в края экрана
    cameraZ *= offset;
    // Устанавливаем камеру
    camera.position.set(0, maxDim * 0.5, cameraZ); // Чуть выше центра
    // Камера должна смотреть в центр мира (где теперь стоит модель)
    camera.lookAt(0, 0, 0);
    // Обновляем параметры камеры
    camera.updateProjectionMatrix();
}