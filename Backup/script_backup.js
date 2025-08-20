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
});