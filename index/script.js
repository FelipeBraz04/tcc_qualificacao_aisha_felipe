const API_BASE_URL = 'http://localhost:3000/api';

async function authenticatedFetch(url, options = {}) {
    const token = localStorage.getItem('jwtToken');
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, { ...options, headers });
    
    if (response.status === 401 || response.status === 403) {
        showToast('Sessão expirada ou não autorizado. Faça login novamente.', true);
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('username');
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
        throw new Error('Não autorizado');
    }
    return response;
}

const toast = document.getElementById('toast');
const logoutBtn = document.getElementById('logout-btn');

function showToast(message, isError = false) {
    if (!toast) return;
    toast.textContent = message;
    toast.style.backgroundColor = isError ? '#e74c3c' : '#2ecc71';
    toast.className = 'toast show';

    setTimeout(() => {
        toast.className = toast.className.replace('show', '');
    }, 3000);
}

function setupLogout() {
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            showConfirmationModal('Deseja realmente sair?', () => {
                localStorage.removeItem('jwtToken');
                localStorage.removeItem('username');
                window.location.href = 'index.html';
            });
        });
    }
}

function showConfirmationModal(message, onConfirm) {
    const modalHtml = `
        <div id="customConfirmModal" style="
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background-color: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 9999;">
            <div style="
                background-color: white; padding: 30px; border-radius: 10px;
                box-shadow: 0 5px 15px rgba(0,0,0,0.3); text-align: center; max-width: 400px;">
                <p style="margin-bottom: 20px; font-size: 1.1em; color: #333;">${message}</p>
                <button id="confirmYes" style="
                    background-color: #2ecc71; color: white; border: none; padding: 10px 20px;
                    border-radius: 5px; margin: 0 10px; cursor: pointer; font-weight: bold;">Sim</button>
                <button id="confirmNo" style="
                    background-color: #e74c3c; color: white; border: none; padding: 10px 20px;
                    border-radius: 5px; margin: 0 10px; cursor: pointer; font-weight: bold;">Não</button>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    const modal = document.getElementById('customConfirmModal');
    document.getElementById('confirmYes').onclick = () => {
        onConfirm();
        modal.remove();
    };
    document.getElementById('confirmNo').onclick = () => {
        modal.remove();
    };
}

document.addEventListener('DOMContentLoaded', function() {
    const userGreeting = document.getElementById('user-greeting');
    if (userGreeting) {
        const username = localStorage.getItem('username');
        if (username) {
            userGreeting.textContent = `Olá, ${username}!`;
        } else {
            userGreeting.textContent = 'Olá, Visitante!';
        }
    }

    setupLogout();

    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (loginForm || registerForm) {
        const tabButtons = document.querySelectorAll('.tab-button');
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                tabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                if (button.dataset.tab === 'login') {
                    if (loginForm) loginForm.style.display = 'block';
                    if (registerForm) registerForm.style.display = 'none';
                } else {
                    if (loginForm) loginForm.style.display = 'none';
                    if (registerForm) registerForm.style.display = 'block';
                }
            });
        });

        if (loginForm) {
            loginForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                const email = document.getElementById('loginEmail').value;
                const password = document.getElementById('loginPassword').value;

                if (!email || !password) {
                    showToast('Por favor, preencha todos os campos.', true);
                    return;
                }

                try {
                    const response = await fetch(`${API_BASE_URL}/auth/login`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, password })
                    });
                    const data = await response.json();

                    if (response.ok) {
                        localStorage.setItem('jwtToken', data.token);
                        localStorage.setItem('username', data.user.username);
                        showToast(data.message);
                        window.location.href = 'sleep-tracker.html';
                    } else {
                        showToast(data.message || 'Erro no login. Verifique suas credenciais.', true);
                    }
                } catch (error) {
                    console.error('Erro de rede ou servidor ao tentar login:', error);
                    showToast('Erro ao tentar conectar ao servidor. Tente novamente mais tarde.', true);
                }
            });
        }

        if (registerForm) {
            registerForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                const username = document.getElementById('registerUsername').value;
                const email = document.getElementById('registerEmail').value;
                const password = document.getElementById('registerPassword').value;

                if (!username || !email || !password) {
                    showToast('Por favor, preencha todos os campos.', true);
                    return;
                }

                if (password.length < 6) {
                    showToast('A senha deve ter pelo menos 6 caracteres.', true);
                    return;
                }

                try {
                    const response = await fetch(`${API_BASE_URL}/auth/register`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username, email, password })
                    });
                    const data = await response.json();

                    if (response.ok) {
                        showToast(data.message);
                        setTimeout(() => {
                            const loginTabButton = document.querySelector('.tab-button[data-tab="login"]');
                            if (loginTabButton) {
                                loginTabButton.click();
                            }
                            registerForm.reset();
                        }, 1500);
                    } else {
                        showToast(data.message || 'Erro no cadastro. Tente novamente.', true);
                    }
                } catch (error) {
                    console.error('Erro de rede ou servidor ao tentar registrar:', error);
                    showToast('Erro ao tentar conectar ao servidor. Tente novamente mais tarde.', true);
                }
            });
        }
    }

    function initializeDatepickers() {
        if ($.fn.datepicker) {
            $('.datepicker').datepicker({
                format: 'dd/mm/yyyy',
                language: 'pt-BR',
                autoclose: true,
                todayHighlight: true
            });
        } else {
            console.warn("jQuery Datepicker não encontrado. Verifique se os scripts estão carregados.");
        }
    }
    
    function setRating(rating) {
        const stars = document.querySelectorAll('.rating-stars i');
        const hiddenInput = document.getElementById('sleepQuality');
        if (!stars.length || !hiddenInput) return;

        hiddenInput.value = rating;
        stars.forEach(s => {
            if (parseInt(s.getAttribute('data-rating')) <= rating) {
                s.classList.remove('far');
                s.classList.add('fas', 'active');
            } else {
                s.classList.remove('fas', 'active');
                s.classList.add('far');
            }
        });
    }

    function setupRatingStars() {
        const stars = document.querySelectorAll('.rating-stars i');
        if (!stars.length) return;

        stars.forEach(star => {
            star.addEventListener('click', function() {
                const rating = parseInt(this.getAttribute('data-rating'));
                setRating(rating);
            });
        });
    }

    if (document.getElementById('sleepForm')) {
        initializeDatepickers();
        setupRatingStars();

        const bedtimeInput = document.getElementById('bedtime');
        const wakeupInput = document.getElementById('wakeup');
        const durationInput = document.getElementById('sleepDuration');

        const urlParams = new URLSearchParams(window.location.search);
        const recordIdToEdit = urlParams.get('edit');
        const isEditMode = recordIdToEdit !== null;

        async function populateFormForEdit(id) {
            try {
                const response = await authenticatedFetch(`${API_BASE_URL}/sleep/${id}`);
                if (!response.ok) throw new Error('Falha ao buscar dados do registro.');
                const record = await response.json();

                document.querySelector('.sleep-form-container h2').innerHTML = '<i class="fas fa-edit"></i> Editar Registro de Sono';
                const submitButton = document.querySelector('#sleepForm button[type="submit"]');
                submitButton.innerHTML = '<i class="fas fa-save"></i> Atualizar Registro';

                $('#sleepDate').datepicker('setDate', new Date(record.sleepDate));
                bedtimeInput.value = record.bedtime;
                wakeupInput.value = record.wakeup;
                document.getElementById('notes').value = record.notes;
                setRating(record.quality);
                
                calculateDuration();

            } catch (error) {
                showToast('Erro ao carregar dados para edição.', true);
                console.error(error);
            }
        }

        if (isEditMode) {
            populateFormForEdit(recordIdToEdit);
        } else {
            $('#sleepDate').datepicker('setDate', new Date());
        }

        function calculateDuration() {
            if (bedtimeInput.value && wakeupInput.value) {
                const bedtime = new Date(`2000-01-01T${bedtimeInput.value}:00`);
                let wakeup = new Date(`2000-01-01T${wakeupInput.value}:00`);
                if (wakeup <= bedtime) {
                    wakeup.setDate(wakeup.getDate() + 1);
                }
                const diffMs = wakeup - bedtime;
                const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
                const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                durationInput.value = `${diffHrs}h ${diffMins}m`;
            } else {
                durationInput.value = '';
            }
        }

        bedtimeInput.addEventListener('change', calculateDuration);
        wakeupInput.addEventListener('change', calculateDuration);
        
        const sleepForm = document.getElementById('sleepForm');
        sleepForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const sleepDate = $('#sleepDate').datepicker('getDate');
            const bedtime = bedtimeInput.value;
            const wakeup = wakeupInput.value;
            const sleepQuality = document.getElementById('sleepQuality').value;
            const notes = document.getElementById('notes').value;
            const duration = durationInput.value;

            if (!sleepDate || !bedtime || !wakeup || sleepQuality === '0') {
                showToast('Por favor, preencha todos os campos obrigatórios.', true);
                return;
            }

            const sleepDataPayload = {
                sleepDate: sleepDate.toISOString(),
                bedtime,
                wakeup,
                duration,
                quality: parseInt(sleepQuality),
                notes
            };

            try {
                let response;
                if (isEditMode) {
                    response = await authenticatedFetch(`${API_BASE_URL}/sleep/${recordIdToEdit}`, {
                        method: 'PUT',
                        body: JSON.stringify(sleepDataPayload)
                    });
                } else {
                    response = await authenticatedFetch(`${API_BASE_URL}/sleep`, {
                        method: 'POST',
                        body: JSON.stringify(sleepDataPayload)
                    });
                }

                const data = await response.json();
                if (response.ok) {
                    if (isEditMode) {
                        showToast('Registro atualizado com sucesso!');
                        setTimeout(() => window.location.href = 'sleep-data.html', 1000);
                    } else {
                        showToast(data.message);
                        fetchRecentRecords();

                        sleepForm.reset();
                        $('#sleepDate').datepicker('setDate', new Date());
                        setRating(0);
                        calculateDuration();
                    }
                } else {
                    showToast(data.message || 'Erro ao salvar registro de sono.', true);
                }
            } catch (error) {
                console.error('Erro ao salvar registro de sono:', error);
                showToast('Erro de rede ou servidor ao salvar registro de sono.', true);
            }
        });

        document.getElementById('cancelBtn')?.addEventListener('click', function() {
            if (isEditMode) {
                window.location.href = 'sleep-data.html';
            } else {
                sleepForm.reset();
                $('#sleepDate').datepicker('setDate', new Date());
                setRating(0);
                calculateDuration();
            }
        });

        async function fetchRecentRecords() {
            const recordsList = document.getElementById('recordsList');
            if (!recordsList) return;
            try {
                const response = await authenticatedFetch(`${API_BASE_URL}/sleep?limit=5`);
                const records = await response.json();
                recordsList.innerHTML = '';
                records.forEach(record => {
                    const recordDate = new Date(record.sleepDate).toLocaleDateString('pt-BR');
                    addRecentRecordToDashboard(recordDate, record.bedtime, record.wakeup, record.duration, record.quality);
                });
            } catch (error) {
                console.error('Erro ao buscar registros recentes:', error);
                showToast('Erro ao carregar registros recentes.', true);
            }
        }

        function addRecentRecordToDashboard(date, bedtime, wakeup, duration, quality) {
            const recordsList = document.getElementById('recordsList');
            if (!recordsList) return;
            const recordCard = document.createElement('div');
            recordCard.className = 'record-item';
            let starsHtml = '';
            for (let i = 1; i <= 5; i++) {
                starsHtml += i <= quality ?
                    '<i class="fas fa-star" style="color: #ffc107;"></i>' :
                    '<i class="far fa-star" style="color: #ffc107;"></i>';
            }
            recordCard.innerHTML = `
                <div>
                    <div class="record-date">${date}</div>
                    <small>${bedtime} - ${wakeup}</small>
                </div>
                <div style="display: flex; align-items: center; gap: 15px;">
                    <span class="record-duration">${duration}</span>
                    <span class="record-quality">${starsHtml}</span>
                </div>
            `;
            recordsList.insertBefore(recordCard, recordsList.firstChild);
            if (recordsList.children.length > 5) {
                recordsList.removeChild(recordsList.lastChild);
            }
        }
        if (!isEditMode) {
            fetchRecentRecords();
        }
    }

    if (document.getElementById('startDate')) {
        initializeDatepickers();
        $('#startDate').datepicker('setDate', '-14d');
        $('#endDate').datepicker('setDate', new Date());

        let currentSleepData = [];
        let durationChartInstance, qualityChartInstance, regularityChartInstance;
        
        const durationToNumeric = (duration) => {
            if (!duration || typeof duration !== 'string' || !duration.includes('h')) {
                return null;
            }
            try {
                const parts = duration.replace('m', '').trim().split('h ');
                const hours = parseInt(parts[0], 10);
                const minutes = parseInt(parts[1], 10) || 0;
                if (isNaN(hours) || isNaN(minutes)) {
                    return null;
                }
                return hours + (minutes / 60);
            } catch (e) {
                console.error("Erro ao processar a duração:", duration, e);
                return null;
            }
        };
        
        const timeToNumeric = (time) => {
            if (!time || typeof time !== 'string' || !time.includes(':')) {
                return null;
            }
            const parts = time.split(':');
            if (parts.length !== 2) return null;
            const hours = parseInt(parts[0], 10);
            const minutes = parseInt(parts[1], 10);
            if (isNaN(hours) || isNaN(minutes)) {
                return null;
            }
            let value = hours + minutes / 60;
            if (value >= 0 && value < 12) {
                value += 24;
            }
            return value;
        };

        function initializeCharts() {
            const durationCtx = document.getElementById('durationChart')?.getContext('2d');
            const qualityCtx = document.getElementById('qualityChart')?.getContext('2d');
            const regularityCtx = document.getElementById('regularityChart')?.getContext('2d');

            if (!durationCtx || !qualityCtx || !regularityCtx) return;

            if (durationChartInstance) durationChartInstance.destroy();
            if (qualityChartInstance) qualityChartInstance.destroy();
            if (regularityChartInstance) regularityChartInstance.destroy();

            durationChartInstance = new Chart(durationCtx, {
                type: 'bar',
                data: {
                    labels: currentSleepData.map(item => new Date(item.sleepDate).toLocaleDateString('pt-BR')),
                    datasets: [{
                        label: 'Duração do Sono (horas)',
                        data: currentSleepData.map(item => durationToNumeric(item.duration)),
                        backgroundColor: 'rgba(102, 126, 234, 0.7)',
                        borderColor: 'rgba(102, 126, 234, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: false,
                            title: {
                                display: true,
                                text: 'Horas'
                            }
                        }
                    }
                }
            });

            qualityChartInstance = new Chart(qualityCtx, {
                type: 'line',
                data: {
                    labels: currentSleepData.map(item => new Date(item.sleepDate).toLocaleDateString('pt-BR')),
                    datasets: [{
                        label: 'Qualidade do Sono (1-5)',
                        data: currentSleepData.map(item => item.quality),
                        backgroundColor: 'rgba(255, 193, 7, 0.2)',
                        borderColor: 'rgba(255, 193, 7, 1)',
                        borderWidth: 2,
                        tension: 0.3,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 5,
                            ticks: {
                                stepSize: 1
                            },
                            title: {
                                display: true,
                                text: 'Avaliação'
                            }
                        }
                    }
                }
            });

            regularityChartInstance = new Chart(regularityCtx, {
                type: 'line',
                data: {
                    labels: currentSleepData.map(item => new Date(item.sleepDate).toLocaleDateString('pt-BR')),
                    datasets: [{
                        label: 'Horário de Dormir',
                        data: currentSleepData.map(item => timeToNumeric(item.bedtime)),
                        borderColor: '#667eea',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        fill: false,
                        tension: 0.2
                    }, {
                        label: 'Horário de Acordar',
                        data: currentSleepData.map(item => timeToNumeric(item.wakeup)),
                        borderColor: '#764ba2',
                        backgroundColor: 'rgba(118, 75, 162, 0.1)',
                        fill: false,
                        tension: 0.2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            ticks: {
                                callback: function(value) {
                                    const hours = Math.floor(value % 24);
                                    const minutes = Math.round((value - Math.floor(value)) * 60);
                                    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
                                }
                            },
                            title: {
                                display: true,
                                text: 'Hora do Dia'
                            }
                        }
                    },
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    let label = context.dataset.label || '';
                                    if (label) {
                                        label += ': ';
                                    }
                                    const value = context.parsed.y;
                                    const hours = Math.floor(value % 24);
                                    const minutes = Math.round((value - Math.floor(value)) * 60);
                                    label += `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
                                    return label;
                                }
                            }
                        }
                    }
                }
            });
        }

        function populateTable(data) {
            const tableBody = document.querySelector('#sleepTable tbody');
            if (!tableBody) return;

            tableBody.innerHTML = '';
            data.forEach(item => {
                const row = document.createElement('tr');
                let stars = '';
                for (let i = 1; i <= 5; i++) {
                    stars += i <= item.quality ?
                        '<i class="fas fa-star" style="color: #ffc107;"></i>' :
                        '<i class="far fa-star" style="color: #ffc107;"></i>';
                }
                row.innerHTML = `
                    <td>${new Date(item.sleepDate).toLocaleDateString('pt-BR')}</td>
                    <td>${item.bedtime || 'N/A'}</td>
                    <td>${item.wakeup || 'N/A'}</td>
                    <td>${item.duration || 'N/A'}</td>
                    <td>${stars}</td>
                    <td>
                        <button class="action-btn view-btn" data-id="${item._id}">
                            <i class="fas fa-eye"></i> Ver
                        </button>
                        <button class="action-btn edit-btn" data-id="${item._id}">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                    </td>
                `;
                tableBody.appendChild(row);
            });

            document.querySelectorAll('.view-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const id = this.getAttribute('data-id');
                    showDetails(id);
                });
            });

            document.querySelectorAll('.edit-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const id = this.getAttribute('data-id');
                    window.location.href = `sleep-tracker.html?edit=${id}`;
                });
            });
        }

        async function showDetails(id) {
            try {
                const response = await authenticatedFetch(`${API_BASE_URL}/sleep/${id}`);
                const record = await response.json();
                if (!response.ok) {
                    showToast(record.message || 'Erro ao carregar detalhes.', true);
                    return;
                }
                const getDicasIA = async (dadosDoSono) => {
                    try {
                        const response = await authenticatedFetch(`${API_BASE_URL}/sleep/dicas`, {
                            method: 'POST',
                            body: JSON.stringify(dadosDoSono),
                        });
                        if (!response.ok) {
                            throw new Error('Erro ao obter dicas da IA.');
                        }
                        const data = await response.json();
                        return data.dicas;
                    } catch (error) {
                        console.error('Erro ao chamar a IA:', error);
                        return "Não foi possível gerar dicas de sono no momento. Tente novamente mais tarde.";
                    }
                };
                const dicas = await getDicasIA({
                    duration: record.duration,
                    quality: record.quality,
                    notes: record.notes
                });
                document.getElementById('modalDate').textContent = `Detalhes do Sono - ${new Date(record.sleepDate).toLocaleDateString('pt-BR')}`;
                document.getElementById('modalBedtime').textContent = record.bedtime;
                document.getElementById('modalWakeup').textContent = record.wakeup;
                document.getElementById('modalDuration').textContent = record.duration;
                const starsContainer = document.getElementById('modalQuality');
                starsContainer.innerHTML = '';
                for (let i = 1; i <= 5; i++) {
                    const star = document.createElement('i');
                    star.className = i <= record.quality ? 'fas fa-star' : 'far fa-star';
                    star.style.color = '#ffc107';
                    starsContainer.appendChild(star);
                }
                document.getElementById('modalNotes').textContent = record.notes || 'Nenhuma observação registrada.';
                const tipsContainer = document.getElementById('modalTipsContainer');
                if (tipsContainer) {
                    tipsContainer.innerHTML = `<h5 style="margin-top: 20px;">Dicas da IA:</h5><p>${dicas.replace(/\n/g, '<br>')}</p>`;
                }

                document.getElementById('editBtn').onclick = function() {
                    window.location.href = `sleep-tracker.html?edit=${id}`;
                };

                document.getElementById('deleteBtn').onclick = async function() {
                    showConfirmationModal(`Tem certeza que deseja excluir o registro de ${new Date(record.sleepDate).toLocaleDateString('pt-BR')}?`, async () => {
                        await deleteRecord(id);
                        closeModal();
                    });
                };
                document.getElementById('detailModal').style.display = 'block';
            } catch (error) {
                console.error('Erro ao buscar detalhes do registro:', error);
                showToast('Erro ao carregar detalhes do registro.', true);
            }
        }

        async function deleteRecord(id) {
            try {
                const response = await authenticatedFetch(`${API_BASE_URL}/sleep/${id}`, {
                    method: 'DELETE'
                });
                const data = await response.json();
                if (response.ok) {
                    showToast(data.message);
                    await fetchAndRenderSleepData(
                        $('#startDate').datepicker('getDate'),
                        $('#endDate').datepicker('getDate')
                    );
                } else {
                    showToast(data.message || 'Erro ao excluir registro.', true);
                }
            } catch (error) {
                console.error('Erro ao excluir registro:', error);
                showToast('Erro de rede ou servidor ao excluir registro.', true);
            }
        }

        function updateSummaryStats() {
            const avgDurationEl = document.getElementById('avgDuration');
            const avgQualityEl = document.getElementById('avgQuality');
            const bestDurationEl = document.getElementById('bestDuration');
            const consistencyEl = document.getElementById('consistency');
            const validRecords = currentSleepData.filter(item => durationToNumeric(item.duration) !== null);
            if (validRecords.length === 0) {
                avgDurationEl.textContent = 'N/A';
                avgQualityEl.textContent = 'N/A';
                bestDurationEl.textContent = 'N/A';
                consistencyEl.textContent = '0%';
                return;
            }
            const totalDurationMinutes = validRecords.reduce((sum, item) => {
                return sum + (durationToNumeric(item.duration) * 60);
            }, 0);
            const avgMinutes = totalDurationMinutes / validRecords.length;
            const avgHours = Math.floor(avgMinutes / 60);
            const remainingMinutes = Math.round(avgMinutes % 60);
            avgDurationEl.textContent = `${avgHours}h ${remainingMinutes}m`;
            const totalQuality = validRecords.reduce((sum, item) => sum + item.quality, 0);
            avgQualityEl.textContent = (totalQuality / validRecords.length).toFixed(1);
            const sortedByDuration = [...validRecords].sort((a, b) => {
                return durationToNumeric(b.duration) - durationToNumeric(a.duration);
            });
            bestDurationEl.textContent = sortedByDuration[0]?.duration || 'N/A';
            const targetMin = avgMinutes;
            const consistentCount = validRecords.filter(item => {
                const itemTotalMinutes = durationToNumeric(item.duration) * 60;
                const difference = Math.abs(itemTotalMinutes - targetMin);
                return difference <= 60;
            }).length;
            const consistencyPercentage = (consistentCount / validRecords.length) * 100;
            consistencyEl.textContent = `${consistencyPercentage.toFixed(0)}%`;
        }

        function closeModal() {
            document.getElementById('detailModal').style.display = 'none';
        }

        document.querySelector('.close-modal')?.addEventListener('click', closeModal);
        window.addEventListener('click', function(event) {
            if (event.target === document.getElementById('detailModal')) {
                closeModal();
            }
        });

        document.getElementById('filterBtn')?.addEventListener('click', async function() {
            const startDate = $('#startDate').datepicker('getDate');
            const endDate = $('#endDate').datepicker('getDate');
            if (!startDate || !endDate) {
                showToast('Por favor, selecione ambas as datas para filtrar.', true);
                return;
            }
            if (startDate > endDate) {
                showToast('A data inicial não pode ser maior que a data final.', true);
                return;
            }
            await fetchAndRenderSleepData(startDate, endDate);
            showToast(`Filtro aplicado - ${currentSleepData.length} registros encontrados.`);
        });

        async function fetchAndRenderSleepData(startDate = null, endDate = null) {
            try {
                let url = `${API_BASE_URL}/sleep`;
                if (startDate && endDate) {
                    url += `?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`;
                }
                const response = await authenticatedFetch(url);
                const data = await response.json();
                if (response.ok) {
                    currentSleepData = data;
                    populateTable(currentSleepData);
                    initializeCharts();
                    updateSummaryStats();
                } else {
                    showToast(data.message || 'Erro ao carregar dados de sono.', true);
                }
            } catch (error) {
                console.error('Erro ao buscar e renderizar dados de sono:', error);
                if (!error.message.includes('Não autorizado')) {
                    showToast('Erro de rede ou servidor ao carregar dados de sono.', true);
                }
            }
        }
        fetchAndRenderSleepData(
            $('#startDate').datepicker('getDate'),
            $('#endDate').datepicker('getDate')
        );
    }
});