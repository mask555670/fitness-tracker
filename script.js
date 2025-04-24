document.addEventListener('DOMContentLoaded', function() {
    // Проверка поддержки localStorage
    if (typeof(Storage) === "undefined") {
        alert("Ваш браузер не поддерживает сохранение данных. Пожалуйста, используйте современный браузер.");
        return;
    }

    // Инициализация данных
    let entries = JSON.parse(localStorage.getItem('fitnessEntries')) || [];
    let workouts = JSON.parse(localStorage.getItem('workouts')) || [];
    
    // Элементы DOM
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const progressForm = document.getElementById('progress-form');
    const workoutForm = document.getElementById('workout-form');
    const addExerciseBtn = document.getElementById('add-exercise-btn');
    const exercisesContainer = document.getElementById('exercises-container');
    const progressList = document.getElementById('progress-list');
    const workoutsList = document.getElementById('workouts-list');

    // Инициализация при загрузке
    loadData();
    renderEntries();
    renderWorkouts();
    setupEventListeners();

    // ===== ФУНКЦИИ =====
    function loadData() {
        const savedEntries = localStorage.getItem('fitnessEntries');
        const savedWorkouts = localStorage.getItem('workouts');
        
        if (savedEntries) entries = JSON.parse(savedEntries);
        if (savedWorkouts) workouts = JSON.parse(savedWorkouts);
    }

    function saveData() {
        try {
            localStorage.setItem('fitnessEntries', JSON.stringify(entries));
            localStorage.setItem('workouts', JSON.stringify(workouts));
        } catch (e) {
            alert("Ошибка сохранения данных. Возможно, недостаточно места.");
            console.error("Ошибка localStorage:", e);
        }
    }

    function setupEventListeners() {
        // Переключение вкладок
        tabBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const tabId = this.getAttribute('data-tab');
                switchTab(tabId);
            });
        });

        // Форма прогресса
        progressForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveProgressEntry();
        });

        // Добавление упражнения
        addExerciseBtn.addEventListener('click', addExercise);

        // Форма тренировки
        workoutForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveWorkout();
        });
    }

    function switchTab(tabId) {
        // Скрыть все вкладки
        tabContents.forEach(content => {
            content.classList.remove('active');
        });

        // Убрать активный класс у всех кнопок
        tabBtns.forEach(btn => {
            btn.classList.remove('active');
        });

        // Показать выбранную вкладку
        document.getElementById(tabId).classList.add('active');
        
        // Активировать соответствующую кнопку
        document.querySelector(`.tab-btn[data-tab="${tabId}"]`).classList.add('active');
    }

    function saveProgressEntry() {
        const newEntry = {
            date: document.getElementById('date').value,
            weight: parseFloat(document.getElementById('weight').value) || 0,
            chest: parseFloat(document.getElementById('chest').value) || 0,
            waist: parseFloat(document.getElementById('waist').value) || 0,
            biceps: parseFloat(document.getElementById('biceps').value) || 0,
            thigh: parseFloat(document.getElementById('thigh').value) || 0
        };

        if (!newEntry.date) {
            alert("Пожалуйста, укажите дату");
            return;
        }

        entries.push(newEntry);
        saveData();
        progressForm.reset();
        renderEntries();
        alert("Замеры успешно сохранены!");
    }

    function addExercise() {
        const exerciseId = Date.now();
        const exerciseDiv = document.createElement('div');
        exerciseDiv.className = 'exercise';
        exerciseDiv.dataset.id = exerciseId;
        exerciseDiv.innerHTML = `
            <div class="exercise-header">
                <h3>Упражнение ${exercisesContainer.children.length + 1}</h3>
                <button type="button" class="btn-danger remove-exercise" data-id="${exerciseId}">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="form-group">
                <label><i class="fas fa-dumbbell"></i> Название упражнения:</label>
                <input type="text" class="exercise-name" placeholder="Введите название" required>
            </div>
            <div class="sets-container" data-id="${exerciseId}">
                <!-- Сюда добавляются подходы -->
            </div>
            <button type="button" class="btn-outline add-set-btn" data-id="${exerciseId}" style="margin-top: 0.5rem;">
                <i class="fas fa-plus"></i> Добавить подход
            </button>
        `;

        exercisesContainer.appendChild(exerciseDiv);
        
        // Обработчики для нового упражнения
        exerciseDiv.querySelector('.remove-exercise').addEventListener('click', function() {
            if (confirm("Удалить это упражнение?")) {
                exerciseDiv.remove();
            }
        });
        
        exerciseDiv.querySelector('.add-set-btn').addEventListener('click', function() {
            addSetToExercise(exerciseId);
        });
    }

    function addSetToExercise(exerciseId) {
        const exercise = document.querySelector(`.exercise[data-id="${exerciseId}"]`);
        const setsContainer = exercise.querySelector('.sets-container');
        
        const setId = Date.now();
        const setDiv = document.createElement('div');
        setDiv.className = 'set';
        setDiv.dataset.id = setId;
        setDiv.innerHTML = `
            <div style="position: relative;">
                <input type="number" placeholder="Вес (кг)" step="0.1" class="set-weight">
                <input type="number" placeholder="Повторения" min="1" class="set-reps">
                <button type="button" class="remove-set" data-id="${setId}">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    
        setsContainer.appendChild(setDiv);
        
        // Обработчик удаления подхода
        setDiv.querySelector('.remove-set').addEventListener('click', function() {
            if (confirm("Удалить этот подход?")) {
                setDiv.remove();
            }
        });
    }

    function saveWorkout() {
        // Проверка даты
        const workoutDate = document.getElementById('workout-date').value;
        if (!workoutDate) {
            alert("Пожалуйста, укажите дату тренировки");
            return;
        }

        // Собираем данные об упражнениях
        const exercises = [];
        const exerciseElements = exercisesContainer.querySelectorAll('.exercise');
        
        if (exerciseElements.length === 0) {
            alert("Добавьте хотя бы одно упражнение");
            return;
        }

        exerciseElements.forEach(exercise => {
            const exerciseName = exercise.querySelector('.exercise-name').value.trim();
            if (!exerciseName) {
                alert("Пожалуйста, введите название для всех упражнений");
                return;
            }

            // Собираем данные о подходах
            const sets = [];
            const setElements = exercise.querySelectorAll('.set');
            
            if (setElements.length === 0) {
                alert(`Добавьте хотя бы один подход для упражнения "${exerciseName}"`);
                return;
            }

            setElements.forEach(set => {
                const weight = parseFloat(set.querySelector('.set-weight').value) || 0;
                const reps = parseInt(set.querySelector('.set-reps').value) || 0;
                
                if (weight > 0 && reps > 0) {
                    sets.push({ weight, reps });
                }
            });

            if (sets.length === 0) {
                alert(`Добавьте хотя бы один подход с корректными данными для упражнения "${exerciseName}"`);
                return;
            }

            exercises.push({
                name: exerciseName,
                sets: sets
            });
        });

        // Сохраняем тренировку
        const newWorkout = {
            date: workoutDate,
            exercises: exercises
        };

        workouts.push(newWorkout);
        saveData();
        workoutForm.reset();
        exercisesContainer.innerHTML = '';
        renderWorkouts();
        alert("Тренировка успешно сохранена!");
    }

    function renderEntries() {
        progressList.innerHTML = '';
        
        if (entries.length === 0) {
            progressList.innerHTML = '<p style="text-align: center; color: var(--gray);">Нет данных о замерах</p>';
            return;
        }

        entries.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(entry => {
            const entryDiv = document.createElement('div');
            entryDiv.className = 'entry';
            entryDiv.innerHTML = `
                <div class="entry-header">
                    <h3>${formatDate(entry.date)}</h3>
                    <button class="btn-danger" onclick="deleteEntry('${entry.date}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="entry-data">
                    <div><i class="fas fa-weight"></i> Вес: <strong>${entry.weight} кг</strong></div>
                    <div><i class="fas fa-ruler-combined"></i> Грудь: <strong>${entry.chest} см</strong></div>
                    <div><i class="fas fa-ruler-combined"></i> Талия: <strong>${entry.waist} см</strong></div>
                    <div><i class="fas fa-ruler-combined"></i> Бицепс: <strong>${entry.biceps} см</strong></div>
                    <div><i class="fas fa-ruler-combined"></i> Бедро: <strong>${entry.thigh} см</strong></div>
                </div>
            `;
            progressList.appendChild(entryDiv);
        });
    }

    function renderWorkouts() {
        workoutsList.innerHTML = '';
        
        if (workouts.length === 0) {
            workoutsList.innerHTML = '<p style="text-align: center; color: var(--gray);">Нет данных о тренировках</p>';
            return;
        }

        workouts.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach((workout, index) => {
            const workoutDiv = document.createElement('div');
            workoutDiv.className = 'workout';
            
            let exercisesHTML = '';
            workout.exercises.forEach(exercise => {
                exercisesHTML += `
                    <div class="exercise">
                        <div class="exercise-header">
                            <h4><i class="fas fa-dumbbell"></i> ${exercise.name}</h4>
                        </div>
                        <div class="workout-sets">
                            ${exercise.sets.map((set, i) => `
                                <div class="set-item">
                                    <span>Подход ${i + 1}:</span>
                                    <span><strong>${set.weight} кг</strong> × ${set.reps} повторений</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            });
            
            workoutDiv.innerHTML = `
                <div class="workout-header">
                    <h3>${formatDate(workout.date)}</h3>
                    <button class="btn-danger" onclick="deleteWorkout(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                ${exercisesHTML}
            `;
            
            workoutsList.appendChild(workoutDiv);
        });
    }

    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('ru-RU', options);
    }
});

// Глобальные функции для удаления
function deleteEntry(date) {
    if (confirm("Вы уверены, что хотите удалить эту запись?")) {
        let entries = JSON.parse(localStorage.getItem('fitnessEntries')) || [];
        entries = entries.filter(entry => entry.date !== date);
        localStorage.setItem('fitnessEntries', JSON.stringify(entries));
        location.reload();
    }
}

function deleteWorkout(index) {
    if (confirm("Вы уверены, что хотите удалить эту тренировку?")) {
        let workouts = JSON.parse(localStorage.getItem('workouts')) || [];
        workouts.splice(index, 1);
        localStorage.setItem('workouts', JSON.stringify(workouts));
        location.reload();
    }
}