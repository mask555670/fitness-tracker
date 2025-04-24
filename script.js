document.addEventListener('DOMContentLoaded', () => {
  // Переключение вкладок
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
          // Удаляем активный класс у всех кнопок и вкладок
          tabBtns.forEach(b => b.classList.remove('active'));
          tabContents.forEach(c => c.classList.remove('active'));
          
          // Добавляем активный класс только к выбранной
          btn.classList.add('active');
          const tabId = btn.getAttribute('data-tab');
          document.getElementById(tabId).classList.add('active');
      });
  });

  // ... остальной ваш код (формы, рендеринг и т.д.) ...
});