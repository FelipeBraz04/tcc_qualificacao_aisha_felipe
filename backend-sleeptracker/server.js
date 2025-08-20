require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const SleepData = require('./models/SleepData');
const { OpenAI } = require('openai');
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const app = express();
const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Conectado ao MongoDB!'))
    .catch(err => console.error('Erro ao conectar ao MongoDB:', err));

app.use(cors()); 
app.use(express.json()); 

const protect = (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded.id; 
            next();
        } catch (error) {
            console.error('Token inválido:', error.message);
            res.status(401).json({ message: 'Não autorizado, token falhou' });
        }
    }
    if (!token) {
        res.status(401).json({ message: 'Não autorizado, nenhum token' });
    }
};

app.post('/api/auth/register', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Por favor, preencha todos os campos.' });
    }

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'Usuário com este email já existe.' });
        }

        const user = await User.create({ username, email, password });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({
            message: 'Usuário registrado com sucesso!',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
            },
            token,
        });
    } catch (error) {
        console.error('Erro no registro:', error);
        res.status(500).json({ message: 'Erro no servidor ao registrar usuário.' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Credenciais inválidas.' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Credenciais inválidas.' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({
            message: 'Login bem-sucedido!',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
            },
            token,
        });
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ message: 'Erro no servidor ao fazer login.' });
    }
});

app.post('/api/sleep', protect, async (req, res) => {
    const { sleepDate, bedtime, wakeup, duration, quality, notes } = req.body;
    const userId = req.user;

    if (!sleepDate || !bedtime || !wakeup || !duration || !quality) {
        return res.status(400).json({ message: 'Por favor, preencha todos os campos obrigatórios.' });
    }

    try {
        const newSleepRecord = await SleepData.create({
            user: userId,
            sleepDate: new Date(sleepDate),
            bedtime,
            wakeup,
            duration,
            quality: parseInt(quality),
            notes,
        });
        res.status(201).json({ message: 'Registro de sono salvo com sucesso!', record: newSleepRecord });
    } catch (error) {
        console.error('Erro ao salvar registro de sono:', error);
        res.status(500).json({ message: 'Erro no servidor ao salvar registro de sono.' });
    }
});

app.get('/api/sleep', protect, async (req, res) => {
    const userId = req.user;
    const { startDate, endDate } = req.query;
    try {
        let query = { user: userId };
        if (startDate && endDate) {
            query.sleepDate = {
                $gte: new Date(startDate),
                $lte: new Date(endDate) 
            };
        }

        const sleepRecords = await SleepData.find(query)
                                            .sort({ sleepDate: -1, createdAt: -1 });
        res.status(200).json(sleepRecords);
    } catch (error) {
        console.error('Erro ao buscar registros de sono:', error);
        res.status(500).json({ message: 'Erro no servidor ao buscar registros de sono.' });
    }
});

app.get('/api/sleep/:id', protect, async (req, res) => {
    try {
        const record = await SleepData.findOne({ _id: req.params.id, user: req.user });
        if (!record) {
            return res.status(404).json({ message: 'Registro de sono não encontrado.' });
        }
        res.status(200).json(record);
    } catch (error) {
        console.error('Erro ao buscar registro de sono:', error);
        res.status(500).json({ message: 'Erro no servidor ao buscar registro de sono.' });
    }
});

app.put('/api/sleep/:id', protect, async (req, res) => {
    const { sleepDate, bedtime, wakeup, duration, quality, notes } = req.body;
    try {
        const record = await SleepData.findOneAndUpdate(
            { _id: req.params.id, user: req.user },
            { sleepDate: new Date(sleepDate), bedtime, wakeup, duration, quality: parseInt(quality), notes },
            { new: true }
        );
        if (!record) {
            return res.status(404).json({ message: 'Registro de sono não encontrado ou você não tem permissão para editá-lo.' });
        }
        res.status(200).json({ message: 'Registro de sono atualizado com sucesso!', record });
    } catch (error) {
        console.error('Erro ao atualizar registro de sono:', error);
        res.status(500).json({ message: 'Erro no servidor ao atualizar registro de sono.' });
    }
});

app.delete('/api/sleep/:id', protect, async (req, res) => {
    try {
        const record = await SleepData.findOneAndDelete({ _id: req.params.id, user: req.user });
        if (!record) {
            return res.status(404).json({ message: 'Registro de sono não encontrado ou você não tem permissão para excluí-lo.' });
        }
        res.status(200).json({ message: 'Registro de sono excluído com sucesso!' });
    } catch (error) {
        console.error('Erro ao excluir registro de sono:', error);
        res.status(500).json({ message: 'Erro no servidor ao excluir registro de sono.' });
    }
});

app.post('/api/sleep/dicas', protect, async (req, res) => {
    const { duration, quality, notes } = req.body;
    
    if (!duration || !quality) {
        return res.status(400).json({ message: 'A duração e a qualidade do sono são necessárias para gerar dicas.' });
    }

    try {
        const completion = await openai.chat.completions.create({
            messages: [{
                role: "user", 
                content: `
                    Você é um assistente de bem-estar do sono. Com base nos seguintes dados de sono do usuário:
                    - Duração do sono: ${duration} horas
                    - Qualidade do sono (escala de 1 a 10): ${quality}
                    - Notas adicionais: ${notes || 'Nenhuma'}

                    Gere 3 dicas práticas e personalizadas para melhorar o sono, focando em higiene do sono e rotinas saudáveis. As dicas devem ser diretas e fáceis de seguir. Não forneça diagnósticos médicos. Formate a resposta como uma lista numerada.
                `
            }],
            model: "gpt-3.5-turbo",
        });

        const dicasDaIA = completion.choices[0].message.content.trim();

        res.status(200).json({ dicas: dicasDaIA });

    } catch (error) {
        console.error("Erro ao gerar dicas de sono:", error);
        if (error.response) {
            console.error(error.response.status, error.response.data);
        }
        res.status(500).json({ message: 'Erro interno no servidor ao gerar as dicas.' });
    }
});
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});