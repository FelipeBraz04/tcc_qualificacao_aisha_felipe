document.addEventListener('DOMContentLoaded', function() {
    const toast = document.getElementById('toast');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    // URL base da API do seu backend (ajuste se seu servidor estiver em outra porta/domínio)
    const API_BASE_URL = 'http://localhost:3000/api';

    // Função para mostrar notificações toast
    function showToast(message, isError = false) {
        toast.textContent = message;
        toast.style.backgroundColor = isError ? '#e74c3c' : '#2ecc71'; // Vermelho para erro, verde para sucesso
        toast.className = 'toast show';

        setTimeout(() => {
            toast.className = toast.className.replace('show', '');
        }, 3000);
    }

    // --- Lógica de Autenticação ---

    // Lida com o envio do formulário de Login
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault(); // Impede o recarregamento da página

            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            // Validação básica de campos
            if (!email || !password) {
                showToast('Por favor, preencha todos os campos.', true);
                return;
            }

            try {
                // Envia os dados de login para o backend
                const response = await fetch(`${API_BASE_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                const data = await response.json(); // Pega a resposta JSON do servidor

                if (response.ok) { // Se a resposta for 200 OK
                    localStorage.setItem('jwtToken', data.token); // Armazena o token JWT
                    localStorage.setItem('username', data.user.username); // Armazena o nome de usuário
                    showToast(data.message); // Mostra mensagem de sucesso
                    // Redireciona para a página principal após o login bem-sucedido
                    window.location.href = 'sleep-tracker.html';
                } else {
                    // Mostra mensagem de erro do servidor
                    showToast(data.message || 'Erro no login. Verifique suas credenciais.', true);
                }
            } catch (error) {
                console.error('Erro de rede ou servidor ao tentar login:', error);
                showToast('Erro ao tentar conectar ao servidor. Tente novamente mais tarde.', true);
            }
        });
    }

    // Lida com o envio do formulário de Cadastro
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault(); // Impede o recarregamento da página

            const username = document.getElementById('registerUsername').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;

            // Validação básica de campos
            if (!username || !email || !password) {
                showToast('Por favor, preencha todos os campos.', true);
                return;
            }

            if (password.length < 6) {
                showToast('A senha deve ter pelo menos 6 caracteres.', true);
                return;
            }

            try {
                // Envia os dados de registro para o backend
                const response = await fetch(`${API_BASE_URL}/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, email, password })
                });
                const data = await response.json(); // Pega a resposta JSON do servidor

                if (response.ok) { // Se a resposta for 200 OK (ou 201 Created)
                    showToast(data.message); // Mostra mensagem de sucesso
                    // Redireciona para a aba de login após o cadastro bem-sucedido
                    setTimeout(() => {
                        // Simula clique no botão de login para alternar a aba
                        const loginTabButton = document.querySelector('.tab-button[data-tab="login"]');
                        if (loginTabButton) {
                            loginTabButton.click();
                        }
                        registerForm.reset(); // Limpa o formulário de registro
                    }, 1500);
                } else {
                    // Mostra mensagem de erro do servidor
                    showToast(data.message || 'Erro no cadastro. Tente novamente.', true);
                }
            } catch (error) {
                console.error('Erro de rede ou servidor ao tentar registrar:', error);
                showToast('Erro ao tentar conectar ao servidor. Tente novamente mais tarde.', true);
            }
        });
    }

 document.addEventListener('DOMContentLoaded', function() {
    const signUpButton = document.getElementById('signUp');
    const signInButton = document.getElementById('signIn');
    const container = document.getElementById('container');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const toast = document.getElementById('toast');

    // Alternar entre login e cadastro
    signUpButton.addEventListener('click', () => {
        container.classList.add('right-panel-active');
    });

    signInButton.addEventListener('click', () => {
        container.classList.remove('right-panel-active');
    });

    // Mostrar notificação toast
    function showToast(message) {
        toast.textContent = message;
        toast.className = 'toast show';
        
        setTimeout(() => {
            toast.className = toast.className.replace('show', '');
        }, 3000);
    }

    // Validação do formulário de login
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        // Validação básica
        if (!email || !password) {
            showToast('Por favor, preencha todos os campos.');
            return;
        }
        
        // Simulação de login bem-sucedido
        showToast('Login realizado com sucesso!');
        loginForm.reset();
        
        // Redirecionamento (simulado)
        // setTimeout(() => {
        //     window.location.href = 'dashboard.html';
        // }, 1500);
    });

    // Validação do formulário de cadastro
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('regName').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('regConfirmPassword').value;
        
        // Validações
        if (!name || !email || !password || !confirmPassword) {
            showToast('Por favor, preencha todos os campos.');
            return;
        }
        
        if (password !== confirmPassword) {
            showToast('As senhas não coincidem.');
            return;
        }
        
        if (password.length < 6) {
            showToast('A senha deve ter pelo menos 6 caracteres.');
            return;
        }
        
        // Simulação de cadastro bem-sucedido
        showToast('Cadastro realizado com sucesso!');
        registerForm.reset();
        
        // Alternar para o formulário de login após cadastro
        setTimeout(() => {
            container.classList.remove('right-panel-active');
        }, 1500);
    });

    // Efeito de digitação no título
    const titles = document.querySelectorAll('h1');
    const texts = ["Crie sua conta", "Faça Login"];
    let i = 0;
    
    function typeWriter(text, element, speed = 100) {
        let j = 0;
        element.textContent = '';
        
        function typing() {
            if (j < text.length) {
                element.textContent += text.charAt(j);
                j++;
                setTimeout(typing, speed);
            }
        }
        
        typing();
    }
    
    // Aplicar efeito a todos os títulos
    titles.forEach((title, index) => {
        setTimeout(() => {
            typeWriter(texts[index % texts.length], title);
        }, index * 500);
    });
})});