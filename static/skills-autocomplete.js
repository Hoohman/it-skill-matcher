document.addEventListener('DOMContentLoaded', function() {
    const skillsInput = document.getElementById('vacancy-skills');
    const suggestionsContainer = document.getElementById('skills-suggestions');
    let allSkills = [];

    // Загружаем навыки с сервера
    fetch('/api/skills')
        .then(response => response.json())
        .then(data => {
            allSkills = data.IT_SKILLS;
            initDragAndDrop(); // Инициализируем перетаскивание после загрузки навыков
        });

    // Инициализация перетаскивания
    function initDragAndDrop() {
        const containers = document.querySelectorAll('.priority-list');
        
        containers.forEach(container => {
            container.addEventListener('dragover', e => {
                e.preventDefault();
                container.style.backgroundColor = 'rgba(0,0,0,0.05)';
            });
            
            container.addEventListener('dragleave', () => {
                container.style.backgroundColor = '';
            });
            
            container.addEventListener('drop', e => {
                e.preventDefault();
                container.style.backgroundColor = '';
                const skillId = e.dataTransfer.getData('text/plain');
                const skill = document.getElementById(skillId);
                if (skill) {
                    container.appendChild(skill);
                }
            });
        });
    }

    // Обработчик ввода
    skillsInput.addEventListener('input', function() {
        const inputText = this.value.toLowerCase();
        if (inputText.length < 2) {
            suggestionsContainer.style.display = 'none';
            return;
        }

        const filteredSkills = allSkills.filter(skill => 
            skill.toLowerCase().includes(inputText) &&
            !Array.from(document.querySelectorAll('.skill-tag'))
                 .some(tag => tag.dataset.skill === skill)
        );

        if (filteredSkills.length > 0) {
            renderSuggestions(filteredSkills);
            suggestionsContainer.style.display = 'block';
        } else {
            suggestionsContainer.style.display = 'none';
        }
    });

    function renderSuggestions(skills) {
        suggestionsContainer.innerHTML = skills.map(skill => `
            <div class="suggestion-item" data-skill="${skill}">${skill}</div>
        `).join('');

        document.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', function() {
                addSelectedSkill(this.dataset.skill);
                skillsInput.value = '';
                suggestionsContainer.style.display = 'none';
            });
        });
    }

    function addSelectedSkill(skill) {
        if (Array.from(document.querySelectorAll('.skill-tag'))
            .some(tag => tag.dataset.skill === skill)) {
            return;
        }

        const skillTag = document.createElement('div');
        skillTag.className = 'skill-tag';
        skillTag.dataset.skill = skill;
        skillTag.draggable = true;
        skillTag.id = 'skill-' + Math.random().toString(36).substr(2, 9);
        skillTag.innerHTML = `
            ${skill}
            <button type="button" class="remove-skill">&times;</button>
        `;

        // Drag events
        skillTag.addEventListener('dragstart', e => {
            e.dataTransfer.setData('text/plain', skillTag.id);
        });

        skillTag.querySelector('.remove-skill').addEventListener('click', function() {
            skillTag.remove();
        });

        document.getElementById('important-skills').appendChild(skillTag);
    }

    // Закрываем подсказки при клике вне поля
    document.addEventListener('click', function(e) {
        if (!skillsInput.contains(e.target) && !suggestionsContainer.contains(e.target)) {
            suggestionsContainer.style.display = 'none';
        }
    });
});