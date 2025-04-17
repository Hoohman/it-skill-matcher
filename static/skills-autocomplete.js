document.addEventListener('DOMContentLoaded', function() {
    const skillsInput = document.getElementById('vacancy-skills');
    const suggestionsContainer = document.getElementById('skills-suggestions');
    const selectedSkillsContainer = document.getElementById('selected-skills');
    let allSkills = [];

    // Загружаем навыки с сервера
    fetch('/api/skills')
        .then(response => response.json())
        .then(data => {
            allSkills = data.IT_SKILLS;
        });

    // Обработчик ввода
    skillsInput.addEventListener('input', function() {
        const inputText = this.value.toLowerCase();
        if (inputText.length < 2) {
            suggestionsContainer.style.display = 'none';
            return;
        }

        const filteredSkills = allSkills.filter(skill => 
            skill.toLowerCase().includes(inputText)
            && !Array.from(selectedSkillsContainer.children)
                     .some(tag => tag.dataset.skill === skill))

        if (filteredSkills.length > 0) {
            renderSuggestions(filteredSkills);
            suggestionsContainer.style.display = 'block';
        } else {
            suggestionsContainer.style.display = 'none';
        }
    });

    // Рендер подсказок
    function renderSuggestions(skills) {
        suggestionsContainer.innerHTML = skills.map(skill => `
            <div class="suggestion-item" data-skill="${skill}">${skill}</div>
        `).join('');

        // Добавляем обработчики клика
        document.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', function() {
                addSelectedSkill(this.dataset.skill);
                skillsInput.value = '';
                suggestionsContainer.style.display = 'none';
            });
        });
    }

    // Добавление выбранного навыка
    function addSelectedSkill(skill) {
        if (Array.from(selectedSkillsContainer.children).some(tag => tag.dataset.skill === skill)) {
            return;
        }

        const skillTag = document.createElement('div');
        skillTag.className = 'skill-tag';
        skillTag.dataset.skill = skill;
        skillTag.innerHTML = `
            ${skill}
            <button type="button">&times;</button>
        `;

        // Удаление навыка по клику на крестик
        skillTag.querySelector('button').addEventListener('click', function() {
            skillTag.remove();
        });

        selectedSkillsContainer.appendChild(skillTag);
    }

    // Закрываем подсказки при клике вне поля
    document.addEventListener('click', function(e) {
        if (!skillsInput.contains(e.target) && !suggestionsContainer.contains(e.target)) {
            suggestionsContainer.style.display = 'none';
        }
    });
});