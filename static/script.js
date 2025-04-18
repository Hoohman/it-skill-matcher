// Восстановление выбранного варианта при загрузке страницы
document.addEventListener('DOMContentLoaded', function () {
    // Проверяем сохраненное значение в localStorage
    const savedSource = localStorage.getItem('vacancySource');
    if (savedSource) {
        // Устанавливаем сохраненное значение
        document.querySelector(`input[name="vacancy_source"][value="${savedSource}"]`).checked = true;

        // Триггерим событие change для применения визуальных изменений
        const event = new Event('change');
        document.querySelector(`input[name="vacancy_source"][value="${savedSource}"]`).dispatchEvent(event);
    }
});

// Переключатель между файлом и ручным вводом
document.querySelectorAll('input[name="vacancy_source"]').forEach(radio => {
    radio.addEventListener('change', function () {
        document.getElementById('vacancy-file-block').style.display =
            this.value === 'file' ? 'block' : 'none';
        document.getElementById('vacancy-manual-block').style.display =
            this.value === 'manual' ? 'block' : 'none';

        // Делаем поле необязательным при ручном вводе
        document.getElementById('vacancy').required = this.value === 'file';

        // Сохраняем выбор в localStorage
        localStorage.setItem('vacancySource', this.value);
    });
});

document.getElementById('upload-form').addEventListener('submit', async function (event) {
    event.preventDefault(); // Предотвращаем стандартную отправку формы

    const vacancySource = document.querySelector('input[name="vacancy_source"]:checked').value;
    const resumeFile = document.getElementById('resume').files[0];
    const vacancyFile = document.getElementById('vacancy').files[0];
    const errorElement = document.getElementById('error');
    const resultsElement = document.getElementById('results');
    const selectedSkills = Array.from(document.querySelectorAll('.skill-tag'))
        .map(tag => tag.dataset.skill);
    const criticalSkills = Array.from(document.querySelectorAll('#critical-skills .skill-tag'))
        .map(tag => tag.dataset.skill);
    const importantSkills = Array.from(document.querySelectorAll('#important-skills .skill-tag'))
        .map(tag => tag.dataset.skill);
    const optionalSkills = Array.from(document.querySelectorAll('#optional-skills .skill-tag'))
        .map(tag => tag.dataset.skill);

    // Сбрасываем предыдущие результаты и ошибки
    errorElement.style.display = 'none';
    resultsElement.style.display = 'none';

    // Проверяем обязательное резюме
    if (!resumeFile) {
        errorElement.textContent = 'Пожалуйста, загрузите файл резюме.';
        errorElement.style.display = 'block';
        return;
    }

    // Проверяем вакансию в зависимости от выбранного способа
    if (vacancySource === 'file' && !vacancyFile) {
        errorElement.textContent = 'Пожалуйста, загрузите файл вакансии или выберите ручной ввод навыков.';
        errorElement.style.display = 'block';
        return;
    }

    if (vacancySource === 'manual' && selectedSkills.length === 0) {
        errorElement.textContent = 'Пожалуйста, выберите хотя бы один навык.';
        errorElement.style.display = 'block';
        return;
    }

    // Создаём FormData
    const formData = new FormData();
    formData.append('resume', resumeFile);
    formData.append('vacancy_source', vacancySource);
    
    if (document.querySelector('input[name="vacancy_source"]:checked').value === 'manual') {
        formData.append('critical_skills', JSON.stringify(criticalSkills));
        formData.append('important_skills', JSON.stringify(importantSkills));
        formData.append('optional_skills', JSON.stringify(optionalSkills));
    } else if (document.getElementById('vacancy').files[0]) {
        formData.append('vacancy', document.getElementById('vacancy').files[0]);
    }

    try {
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            // Показываем имя
            document.getElementById('name').textContent = `${data.name}`;

            // Показываем контакты
            document.getElementById('contact-email').textContent = data.contacts.email;
            document.getElementById('contact-phone').textContent = data.contacts.phone;

            // Показываем результаты по приоритетам
            const priorityResults = `
            <div class="priority-results">
                <h4>🔴 Критические навыки:</h4>
                <p>Совпало: ${data.skills_by_priority.critical.matched.join(', ') || 'нет'}</p>
                <p>Отсутствуют: ${data.skills_by_priority.critical.missing.join(', ') || 'нет'}</p>
                
                <h4>🟡 Желательные навыки:</h4>
                <p>Совпало: ${data.skills_by_priority.important.matched.join(', ') || 'нет'}</p>
                <p>Отсутствуют: ${data.skills_by_priority.important.missing.join(', ') || 'нет'}</p>
                
                <h4>🟢 Дополнительные навыки:</h4>
                <p>Совпало: ${data.skills_by_priority.optional.matched.join(', ') || 'нет'}</p>
                <p>Отсутствуют: ${data.skills_by_priority.optional.missing.join(', ') || 'нет'}</p>
            </div>
        `;

        document.getElementById('priority-results').innerHTML = priorityResults;
        document.getElementById('matched-skills').textContent = data.matched.length
            ? data.matched.join(', ')
            : 'Ничего не найдено';

            // Показываем результаты
            document.getElementById('matched-skills').textContent = data.matched.length
                ? data.matched.join(', ')
                : 'Ничего не найдено';
            document.getElementById('missing-skills').textContent = data.missing.length
                ? data.missing.join(', ')
                : 'Нет пробелов';
            document.getElementById('match-percent').innerHTML = `<strong>${data.match_percent}%</strong> соответствия вакансии`;

            // Отрисовываем роли
            const roleResults = document.getElementById('role-results');
            roleResults.innerHTML = '';
            for (const [role, info] of Object.entries(data.role_results)) {
                const roleDiv = document.createElement('div');
                roleDiv.className = 'role';
                roleDiv.innerHTML = `
                    <h4>${role} — ${info.match_percent}% соответствия</h4>
                    <p>Совпадающие навыки: ${info.matched_skills.length ? info.matched_skills.join(', ') : '—'}</p>
                `;
                roleResults.appendChild(roleDiv);
            }

            resultsElement.style.display = 'block';
            document.getElementById('download-btn').style.display = 'block';
            window.currentResults = data.role_results;
            window.currentMatchedSkills = data.matched;
            window.currentMissingSkills = data.missing;

            document.getElementById('resume-preview').textContent = data.resume_text;
            document.getElementById('toggle-preview').style.display = 'block';
            document.getElementById('resume-preview').style.display = 'none';

        } else {
            // Показываем ошибку
            errorElement.textContent = data.error || 'Произошла ошибка при обработке файлов.';
            errorElement.style.display = 'block';
        }
    } catch (err) {
        if (err instanceof TypeError && err.message.includes("413")) {
            errorElement.textContent = 'Размер файла превышает 5 МБ';
        } else {
            errorElement.textContent = 'Ошибка соединения с сервером.';
        }
        errorElement.style.display = 'block';
    }
});

document.getElementById('download-btn').addEventListener('click', async function () {
    const data = {
        name: document.getElementById('name').textContent,
        contacts: {
            email: document.getElementById('contact-email').textContent,
            phone: document.getElementById('contact-phone').textContent
        },
        match_percent: parseFloat(document.getElementById('match-percent').textContent),
        matched: window.currentMatchedSkills,
        missing: window.currentMissingSkills,
        role_results: window.currentResults
    };

    const response = await fetch('/download-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    const blob = await response.blob();
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = `Отчет_${data.name}.docx`;
    link.click();
});

document.getElementById('toggle-preview').addEventListener('click', function () {
    const preview = document.getElementById('resume-preview');
    if (preview.style.display === 'none') {
        preview.style.display = 'block';
        this.textContent = '📖 Скрыть резюме';
    } else {
        preview.style.display = 'none';
        this.textContent = '📖 Показать резюме';
    }
});