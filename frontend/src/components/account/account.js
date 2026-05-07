import React, { useState, useEffect } from 'react';
import { api } from '../../api';

const Account = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('access'));
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [invitations, setInvitations] = useState([]);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            await api.login(credentials.username, credentials.password);
            setIsLoggedIn(true);
            loadInvitations();
        } catch (err) {
            alert("Неверный логин или пароль");
        }
    };

    const loadInvitations = async () => {
        const data = await api.get('invitations/');
        setInvitations(data);
    };

    useEffect(() => {
        if (isLoggedIn) loadInvitations();
    }, [isLoggedIn]);

    if (!isLoggedIn) {
        return (
            <form onSubmit={handleLogin} className="login-form">
                <input 
                    type="text" 
                    placeholder="Логин" 
                    onChange={e => setCredentials({...credentials, username: e.target.value})} 
                />
                <input 
                    type="password" 
                    placeholder="Пароль" 
                    onChange={e => setCredentials({...credentials, password: e.target.value})} 
                />
                <button type="submit">Войти</button>
            </form>
        );
    }

    return (
        <div className="account-page">
            <h2>Привет, {credentials.username}!</h2>
            <h3>Твои приглашения:</h3>
            {invitations.map(inv => (
                <div key={inv.id}>
                    Группа: {inv.group_name} 
                    <button onClick={() => api.post(`invitations/${inv.id}/accept/`).then(loadInvitations)}>Принять</button>
                </div>
            ))}
            <button onClick={() => { localStorage.clear(); setIsLoggedIn(false); }}>Выйти</button>
        </div>
    );
};

export default Account;